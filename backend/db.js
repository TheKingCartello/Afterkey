const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

// Create the file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ switches: {} }));
}

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getSwitch(userId) {
  return readDB().switches[userId] || null;
}

function saveSwitch(userId, switchData) {
  const db = readDB();
  db.switches[userId] = switchData;
  writeDB(db);
}

function deleteSwitch(userId) {
  const db = readDB();
  delete db.switches[userId];
  writeDB(db);
}

function getAllSwitches() {
  return readDB().switches;
}

module.exports = { getSwitch, saveSwitch, deleteSwitch, getAllSwitches };