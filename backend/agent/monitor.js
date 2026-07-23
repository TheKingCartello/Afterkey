const cron = require('node-cron');
const axios = require('axios');
const { getAllSwitches, getSwitch, saveSwitch } = require('../db');

const KH_API = 'https://app.keeperhub.com/api';
const HEADERS = {
  'Authorization': `Bearer ${process.env.KEEPERHUB_API_KEY}`,
  'Content-Type': 'application/json'
};

async function executeTransfer(sw, isRetry = false) {
  try {
    console.log(`${isRetry ? 'Retrying' : 'Triggering'} transfer for ${sw.switchId}...`);

    const response = await axios.post(`${KH_API}/execute/transfer`, {
      network: 'sepolia',
      recipientAddress: sw.beneficiary,
      amount: sw.amount
    }, { headers: HEADERS });

    console.log('KeeperHub response:', JSON.stringify(response.data, null, 2));

    const txData = {
      executionId: response.data.executionId,
      triggeredAt: new Date().toISOString(),
      status: 'pending',
      attempt: (sw.retryCount || 0) + 1,
      error: null
    };

    sw.txHistory.push(txData);
    sw.status = 'triggered';
    sw.retryCount = (sw.retryCount || 0) + 1;
    sw.lastError = null;
    await saveSwitch(sw.switchId, sw);
    pollExecutionStatus(sw.switchId, response.data.executionId);

    console.log(`Transfer triggered for ${sw.switchId}. Execution ID: ${response.data.executionId}`);
    return true;

  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    console.error(`Transfer failed for ${sw.switchId}:`, errorMsg);
    sw.lastError = errorMsg;
    sw.status = 'failed';
    await saveSwitch(sw.switchId, sw);
    return false;
  }
}

async function pollExecutionStatus(switchId, executionId) {
  const maxAttempts = 10;
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    try {
      const response = await axios.get(
        `${KH_API}/execute/${executionId}/status`,
        { headers: HEADERS }
      );

      const { status } = response.data;

      if (status === 'completed' || status === 'failed') {
        const sw = await getSwitch(switchId);
        if (sw) {
          sw.txHistory = sw.txHistory.map(tx =>
            tx.executionId === executionId
              ? {
                  ...tx,
                  status,
                  transactionHash: response.data.transactionHash,
                  transactionLink: response.data.transactionLink,
                  gasUsedWei: response.data.gasUsedWei,
                  gasPriceWei: response.data.gasPriceWei,
                  estimatedCostUsd: response.data.estimatedCostUsd,
                  retryCount: response.data.retryCount,
                  completedAt: response.data.completedAt,
                  error: response.data.error || null
                }
              : tx
          );
          if (status === 'failed') {
            sw.status = 'failed';
            sw.lastError = response.data.error || 'Unknown error';
          }
          await saveSwitch(switchId, sw);
          console.log(`Execution ${executionId} resolved: ${status}`);
        }
        clearInterval(interval);
      }

      if (attempts >= maxAttempts) clearInterval(interval);

    } catch (err) {
      console.error('Polling error:', err.message);
      clearInterval(interval);
    }
  }, 30000);
}

async function checkSwitches() {
  console.log('Monitor running check...');
  const switches = await getAllSwitches();

  for (const switchId in switches) {
    const sw = switches[switchId];
    const retryCount = sw.retryCount || 0;

    const lastTx = sw.txHistory?.[sw.txHistory.length - 1];
    const lastTxFailed = lastTx?.status === 'failed';

    if ((sw.status === 'failed' || lastTxFailed) && retryCount < 3) {
      console.log(`Auto retrying failed switch for ${switchId} (attempt ${retryCount + 1}/3)...`);
      await executeTransfer(sw, true);
      continue;
    }

    if (sw.status !== 'active') continue;

    const lastCheckin = new Date(sw.lastCheckin);
    const now = new Date();
    const daysSince = (now - lastCheckin) / (1000 * 60 * 60 * 24);

    console.log(`${switchId} — days since checkin: ${daysSince.toFixed(2)}`);

    if (daysSince >= sw.intervalDays) {
      await executeTransfer(sw);
    }
  }
}

function startMonitor() {
  cron.schedule('* * * * *', checkSwitches);
  setInterval(checkSwitches, 5000);
  console.log('AfterKey monitor started');
}

module.exports = { startMonitor, checkSwitches, executeTransfer };