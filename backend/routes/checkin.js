const express = require('express');
const router = express.Router();
const { getSwitch, saveSwitch } = require('../db');

router.post('/:switchId', async (req, res) => {
  const sw = await getSwitch(req.params.switchId);

  if (!sw) return res.status(404).json({ error: 'Switch not found' });

  if (sw.status !== 'active') {
    return res.status(400).json({ error: 'Switch is no longer active' });
  }

  const now = Date.now();
  sw.lastCheckin = new Date(now).toISOString();
  sw.deadline = new Date(now + sw.intervalDays * 24 * 60 * 60 * 1000).toISOString();
  await saveSwitch(sw.switchId, sw);

  res.json({ message: 'Check-in successful', lastCheckin: sw.lastCheckin, deadline: sw.deadline });
});

module.exports = router;