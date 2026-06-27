const { query } = require('../config/database')

const Setting = {
  get: async () => {
    const rows = await query('SELECT * FROM settings LIMIT 1')
    return rows[0] || null
  },
  update: async (payload) => {
    await query(`UPDATE settings SET site_name = ?, currency = ?, timezone = ?, notification_email = ? WHERE id = 1`, [
      payload.site_name, payload.currency, payload.timezone, payload.notification_email
    ])
    const rows = await query('SELECT * FROM settings LIMIT 1')
    return rows[0] || null
  }
}

module.exports = Setting
