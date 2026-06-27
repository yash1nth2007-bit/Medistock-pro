const { query } = require('../config/database')

const Prescription = {
  findAll: async ({ page = 1, limit = 20, search = '' }) => {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
    const where = []
    const params = []

    if (search) {
      where.push('(prescription_number LIKE ? OR patient_name LIKE ? OR doctor_name LIKE ?)')
      const term = `%${search}%`
      params.push(term, term, term)
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const rows = await query(
      `SELECT SQL_CALC_FOUND_ROWS * FROM prescriptions ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    )

    const totalRows = await query('SELECT FOUND_ROWS() AS total')
    const total = totalRows[0]?.total || 0
    const pages = Math.ceil(total / parseInt(limit, 10))

    return {
      data: rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages
      }
    }
  },

  create: async (payload) => {
    const rxNumber = `RX${Date.now()}`
    const result = await query(
      `INSERT INTO prescriptions (prescription_number, patient_id, patient_name, doctor_id, doctor_name, notes, medicines, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        rxNumber,
        payload.patient_id || null,
        payload.patient_name || 'Walk-in',
        payload.doctor_id || null,
        payload.doctor_name || 'Unknown',
        payload.notes || null,
        JSON.stringify(payload.medicines || [])
      ]
    )

    const rows = await query('SELECT * FROM prescriptions WHERE id = ?', [result.insertId])
    return rows[0] || null
  }
}

module.exports = Prescription
