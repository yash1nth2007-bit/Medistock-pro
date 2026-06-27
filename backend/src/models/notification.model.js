const { query } = require('../config/database')

const Notification = {
  findAll: async ({ page = 1, limit = 20, unread_only }) => {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
    const where = []
    const params = []

    if (unread_only === 'true' || unread_only === true) {
      where.push('is_read = 0')
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const rows = await query(
      `SELECT SQL_CALC_FOUND_ROWS * FROM notifications ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    )

    const totalRows = await query('SELECT FOUND_ROWS() AS total')
    const total = totalRows[0]?.total || 0
    const pages = Math.ceil(total / parseInt(limit, 10))

    const unreadCountRow = await query('SELECT COUNT(*) AS unread_count FROM notifications WHERE is_read = 0')
    const unreadCount = unreadCountRow[0]?.unread_count || 0

    return {
      data: rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages
      },
      unread_count: unreadCount
    }
  },

  markAsRead: async (id) => {
    await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id])
    return true
  },

  markAllAsRead: async () => {
    await query('UPDATE notifications SET is_read = 1 WHERE is_read = 0')
    return true
  }
}

module.exports = Notification
