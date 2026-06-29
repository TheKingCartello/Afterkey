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
    saveSwitch(sw.userId, sw);

    console.log(`Transfer triggered for ${sw.userId}. Execution ID: ${response.data.executionId}`);
  } catch (err) {
    console.error(`Transfer failed for ${sw.userId}:`, err.response?.data || err.message);
  }
}

async function checkSwitches() {
  console.log('Monitor running check...');
  const switches = getAllSwitches();

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
  // Runs every hour
  cron.schedule('0 * * * *', checkSwitches);
  console.log('AfterKey monitor started');
}

module.exports = { startMonitor, checkSwitches };