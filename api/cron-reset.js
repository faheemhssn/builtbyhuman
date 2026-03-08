import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: usersToReset } = await supabase
    .from('users')
    .select('user_id, scan_limit')
    .lte('reset_date', today)

  if (!usersToReset || usersToReset.length === 0) {
    return res.status(200).json({ message: 'No users to reset', count: 0 })
  }

  for (const user of usersToReset) {
    const newResetDate = new Date()
    newResetDate.setMonth(newResetDate.getMonth() + 1)
    await supabase
      .from('users')
      .update({
        scans_used: 0,
        reset_date: newResetDate.toISOString().split('T')[0]
      })
      .eq('user_id', user.user_id)
  }

  return res.status(200).json({ message: 'Reset complete', count: usersToReset.length })
}