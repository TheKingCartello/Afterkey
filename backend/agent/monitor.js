const cron = require('node-cron');
const axios = require('axios');
const { getAllSwitches, getSwitch, saveSwitch } = require('../db');

const KH_API = 'https://app.keeperhub.com/api';
const HEADERS = {
  'Authorization': `Bearer ${process.env.KEEPERHUB_API_KEY}`,
  'Content-Type': 'application/json'
};

async function executeTransfer(sw) {
  try {
    console.log(`Triggering transfer for ${sw.userId}...`);

    const response = await axios.post(`${KH_API}/execute/transfer`, {
      network: 'sepolia',
      recipientAddress: sw.beneficiary,
      amount: sw.amount
    }, { headers: HEADERS });

    console.log('KeeperHub response:', JSON.stringify(response.data, null, 2));

    const txData = {
      executionId: response.data.executionId,
      triggeredAt: new Date().toISOString(),
      status: 'pending'
    };

    sw.txHistory.push(txData);
    sw.status = 'triggered';
    await saveSwitch(sw.userId, sw);
    pollExecutionStatus(sw.userId, response.data.executionId);

    console.log(`Transfer triggered for ${sw.userId}. Execution ID: ${response.data.executionId}`);
  } catch (err) {
    console.error(`Transfer failed for ${sw.userId}:`, err.response?.data || err.message);
  }
}

async function pollExecutionStatus(userId, executionId) {
  const maxAttempts = 10;
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    try {
      const response = await axios.get(
        `${KH_API}/execute/${executionId}/status`,
        { headers: HEADERS }
      );

      const { status, transactionHash } = response.data;

      if (status === 'completed' || status === 'failed') {
        const sw = await getSwitch(userId);
        if (sw) {
          sw.txHistory = sw.txHistory.map(tx =>
            tx.executionId === executionId
              ? { ...tx, status, transactionHash }
              : tx
          );
          await saveSwitch(userId, sw);
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

  for (const userId in switches) {
    const sw = switches[userId];

    if (sw.status !== 'active') continue;

    const lastCheckin = new Date(sw.lastCheckin);
    const now = new Date();
    const daysSince = (now - lastCheckin) / (1000 * 60 * 60 * 24);

    console.log(`${userId} — days since checkin: ${daysSince.toFixed(2)}`);

    if (daysSince >= sw.intervalDays) {
      await executeTransfer(sw);
    }
  }
}

function startMonitor() {
  cron.schedule('0 * * * *', checkSwitches);
  console.log('AfterKey monitor started');
}

module.exports = { startMonitor, checkSwitches };