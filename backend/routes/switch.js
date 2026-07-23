const express = require('express');
const router = express.Router();
const { getSwitch, getSwitchesByUser, saveSwitch, deleteSwitch, generateSwitchId } = require('../db');

// Create a new switch
router.post('/create', async (req, res) => {
  const { userId, beneficiary, intervalDays, amount } = req.body;

  if (!userId || !beneficiary || !intervalDays || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const switchId = generateSwitchId();
  const now = Date.now();

  const switchData = {
    switchId,
    userId,
    beneficiary,
    intervalDays,
    amount,
    createdAt: new Date(now).toISOString(),
    lastCheckin: new Date(now).toISOString(),
    deadline: new Date(now + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    workflowId: null,
    txHistory: [],
    retryCount: 0,
    lastError: null
  };

  await saveSwitch(switchId, switchData);
  res.json({ message: 'Switch created successfully', switch: switchData });
});

// Get all switches for a user
router.get('/user/:userId', async (req, res) => {
  const switches = await getSwitchesByUser(req.params.userId);
  res.json(switches);
});

// Get a single switch
router.get('/:switchId', async (req, res) => {
  const sw = await getSwitch(req.params.switchId);
  if (!sw) return res.status(404).json({ error: 'Switch not found' });
  res.json(sw);
});

// Delete a switch
router.delete('/:switchId', async (req, res) => {
  const sw = await getSwitch(req.params.switchId);
  if (!sw) return res.status(404).json({ error: 'Switch not found' });
  await deleteSwitch(req.params.switchId);
  res.json({ message: 'Switch deleted' });
});

// Retry a failed switch
router.post('/retry/:switchId', async (req, res) => {
  const sw = await getSwitch(req.params.switchId);
  if (!sw) return res.status(404).json({ error: 'Switch not found' });

  const { executeTransfer } = require('../agent/monitor');
  await executeTransfer(sw, true);

  const updated = await getSwitch(req.params.switchId);
  res.json({ message: 'Retry triggered', switch: updated });
});

module.exports = router;