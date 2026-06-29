require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors')
const switchRoutes = require('./routes/switch');
const checkinRoutes = require('./routes/checkin');
const { startMonitor, checkSwitches } = require('./agent/monitor');

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'AfterKey API is running' })
})

app.use('/api/switch', switchRoutes);
app.use('/api/checkin', checkinRoutes);

app.use(express.static('../frontend'));

const PORT = process.env.PORT || 3000;
startMonitor();
app.listen(PORT, () => {
  console.log(`AfterKey server running on port ${PORT}`);
});