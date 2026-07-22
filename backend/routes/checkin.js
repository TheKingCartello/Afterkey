const express = require('express');
const router = express.Router();
const { getSwitch, saveSwitch } = require('../db');

router.post('/:userId', async (req, res) => {
  const sw = await getSwitch(req.params.userId);

  if (!sw) return res.status(404).json({ error: 'Switch not found' });

  if (sw.status !== 'active') {
    return res.status(400).json({ error: 'Switch is no longer active' });
  }

  sw.lastCheckin = new Date().toISOString();
  sw.deadline = new Date(Date.now() + sw.intervalDays * 24 * 60 * 60 * 1000).toISOString()
  await saveSwitch(req.params.userId, sw);

  res.json({ message: 'Check-in successful', lastCheckin: sw.lastCheckin });
});

module.exports = router;