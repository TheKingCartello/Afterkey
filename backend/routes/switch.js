const express = require('express');
const router = express.Router();
const { getSwitch, saveSwitch, deleteSwitch } = require('../db');

router.post('/create', async (req, res) => {
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
    lastCheckin: new Date(Date.now() + 30000).toISOString(),
    status: 'active',
    workflowId: null,
    txHistory: []
  };

  await saveSwitch(userId, switchData);

  res.json({ message: 'Switch created successfully', switch: switchData });
});

router.post('/retry/:userId', async (req, res) => {
  const sw = await getSwitch(req.params.userId);
  if (!sw) return res.status(404).json({ error: 'Switch not found' });

  if (sw.status !== 'failed') {
    return res.status(400).json({ error: 'Switch is not in a failed state' });
  }

  const { executeTransfer } = require('../agent/monitor');
  await executeTransfer(sw, true);

  const updated = await getSwitch(req.params.userId);
  res.json({ message: 'Retry triggered', switch: updated });
});

router.get('/:userId', async (req, res) => {
  const sw = await getSwitch(req.params.userId);
  if (!sw) return res.status(404).json({ error: 'Switch not found' });
  res.json(sw);
});

router.delete('/:userId', async (req, res) => {
  const sw = await getSwitch(req.params.userId);
  if (!sw) return res.status(404).json({ error: 'Switch not found' });
  await deleteSwitch(req.params.userId);
  res.json({ message: 'Switch deleted' });
});

module.exports = router;