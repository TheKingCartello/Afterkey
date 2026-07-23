const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getSwitchesByUser(userId) {
  const { data } = await supabase
    .from('switches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data || []).map(mapFromDB);
}

async function getSwitch(switchId) {
  const { data } = await supabase
    .from('switches')
    .select('*')
    .eq('switch_id', switchId)
    .single();
  return data ? mapFromDB(data) : null;
}

async function saveSwitch(switchId, sw) {
  const { error } = await supabase
    .from('switches')
    .upsert(mapToDB(sw), { onConflict: 'switch_id' });
  if (error) console.error('Supabase save error:', error);
}

async function deleteSwitch(switchId) {
  await supabase
    .from('switches')
    .delete()
    .eq('switch_id', switchId);
}

async function getAllSwitches() {
  const { data } = await supabase
    .from('switches')
    .select('*');
  const result = {};
  (data || []).forEach(row => result[row.switch_id] = mapFromDB(row));
  return result;
}

function generateSwitchId() {
  return uuidv4();
}

function mapToDB(sw) {
  return {
    switch_id: sw.switchId,
    user_id: sw.userId,
    beneficiary: sw.beneficiary,
    interval_days: sw.intervalDays,
    amount: sw.amount,
    created_at: sw.createdAt,
    last_checkin: sw.lastCheckin,
    deadline: sw.deadline || null,
    status: sw.status,
    workflow_id: sw.workflowId,
    tx_history: sw.txHistory,
    retry_count: sw.retryCount || 0,
    last_error: sw.lastError || null
  };
}

function mapFromDB(row) {
  return {
    switchId: row.switch_id,
    userId: row.user_id,
    beneficiary: row.beneficiary,
    intervalDays: row.interval_days,
    amount: row.amount,
    createdAt: row.created_at,
    lastCheckin: row.last_checkin,
    deadline: row.deadline || null,
    status: row.status,
    workflowId: row.workflow_id,
    txHistory: row.tx_history || [],
    retryCount: row.retry_count || 0,
    lastError: row.last_error || null
  };
}

module.exports = { getSwitchesByUser, getSwitch, saveSwitch, deleteSwitch, getAllSwitches, generateSwitchId };