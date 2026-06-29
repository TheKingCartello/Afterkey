const express = require('express');
const router = express.Router();
const { getSwitch, saveSwitch } = require('../db');

router.post('/:userId', (req, res) => {
  const sw = getSwitch(req.params.userId);

  if (!sw) return res.status(404).json({ error: 'Switch not found' });

  if (sw.status !== 'active') {
    return res.status(400).json({ error: 'Switch is no longer active' });
  }

  sw.lastCheckin = new Date().toISOString();
  saveSwitch(req.params.userId, sw);

  res.json({ message: 'Check-in successful', lastCheckin: sw.lastCheckin });
});

module.exports = router;