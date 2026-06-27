const router = require('express').Router()
const { query } = require('../config/database')

router.get('/', async (req, res) => {
  const { page = 1, limit = 20, search = '', status = '' } = req.query
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
  const where = []
  const params = []

  if (search) {
    where.push('(name LIKE ? OR company_name LIKE ? OR contact_person LIKE ? OR phone LIKE ?)')
    const term = `%${search}%`
    params.push(term, term, term, term)
  }
  if (status) {
    where.push('status = ?'); params.push(status)
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const rows = await query(`SELECT SQL_CALC_FOUND_ROWS * FROM suppliers ${whereSql} ORDER BY name LIMIT ? OFFSET ?`, [...params, parseInt(limit, 10), offset])
  const totalRows = await query('SELECT FOUND_ROWS() AS total')
  const total = totalRows[0]?.total || 0
  const pages = Math.ceil(total / parseInt(limit, 10))

  res.json({ data: rows, pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages } })
})

router.post('/', async (req, res) => {
  const payload = req.body
  const result = await query(`INSERT INTO suppliers (name, company_name, contact_person, phone, email, gst_number, address, city, state, credit_limit, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      payload.name, payload.company_name, payload.contact_person, payload.phone, payload.email,
      payload.gst_number, payload.address, payload.city, payload.state, payload.credit_limit || 0, 'active'
  ])
  const rows = await query('SELECT * FROM suppliers WHERE id = ?', [result.insertId])
  res.status(201).json({ data: rows[0] })
})

router.put('/:id', async (req, res) => {
  const payload = req.body
  await query(`UPDATE suppliers SET name = ?, company_name = ?, contact_person = ?, phone = ?, email = ?, gst_number = ?, address = ?, city = ?, state = ?, credit_limit = ? WHERE id = ?`, [
    payload.name, payload.company_name, payload.contact_person, payload.phone, payload.email,
    payload.gst_number, payload.address, payload.city, payload.state, payload.credit_limit || 0, req.params.id
  ])
  const rows = await query('SELECT * FROM suppliers WHERE id = ?', [req.params.id])
  res.json({ data: rows[0] })
})

router.delete('/:id', async (req, res) => {
  await query('UPDATE suppliers SET status = ? WHERE id = ?', ['inactive', req.params.id])
  res.json({ message: 'Supplier deactivated' })
})

module.exports = router
