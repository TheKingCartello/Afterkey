const express = require('express');
const router = express.Router();
const { getSwitch, saveSwitch, deleteSwitch } = require('../db');

// Create or update a switch
router.post('/create', (req, res) => {
  const { userId, beneficiary, intervalDays, amount } = req.body;

  if (!userId || !beneficiary || !intervalDays || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const switchData = {
    userId,
    beneficiary,
    intervalDays,
    amount,
    createdAt: new Date().toISOString(),
    lastCheckin: new Date().toISOString(),
    status: 'active',
    workflowId: null,  // KeeperHub workflow ID, added later
    txHistory: []
  };

  saveSwitch(userId, switchData);

  res.json({ message: 'Switch created successfully', switch: switchData });
});

// Get a switch
router.get('/:userId', (req, res) => {
  const sw = getSwitch(req.params.userId);
  if (!sw) return res.status(404).json({ error: 'Switch not found' });
  res.json(sw);
});

// Delete a switch
router.delete('/:userId', (req, res) => {
  const sw = getSwitch(req.params.userId);
  if (!sw) return res.status(404).json({ error: 'Switch not found' });
  deleteSwitch(req.params.userId);
  res.json({ message: 'Switch deleted' });
});

module.exports = router;