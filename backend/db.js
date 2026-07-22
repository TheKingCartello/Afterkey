const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getSwitch(userId) {
  const { data } = await supabase
    .from('switches')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data ? mapFromDB(data) : null;
}

async function saveSwitch(userId, sw) {
  await supabase
    .from('switches')
    .upsert(mapToDB(sw), {onConflict: 'user_id'});
}

async function deleteSwitch(userId) {
  await supabase
    .from('switches')
    .delete()
    .eq('user_id', userId);
}

async function getAllSwitches() {
  const { data } = await supabase
    .from('switches')
    .select('*');
  const result = {};
  (data || []).forEach(row => result[row.user_id] = mapFromDB(row));
  return result;
}

// Supabase uses snake_case columns, our app uses camelCase — these convert between them
function mapToDB(sw) {
  return {
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

module.exports = { getSwitch, saveSwitch, deleteSwitch, getAllSwitches };