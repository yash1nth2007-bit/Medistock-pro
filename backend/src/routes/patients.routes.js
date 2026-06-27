const router = require('express').Router()
const { query } = require('../config/database')

router.get('/', async (req, res) => {
  const { page = 1, limit = 20, search = '', gender = '', blood_group = '' } = req.query
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
  const where = ['status != ?']
  const params = ['inactive']

  if (search) {
    where.push('(full_name LIKE ? OR phone LIKE ? OR patient_id LIKE ?)')
    const term = `%${search}%`
    params.push(term, term, term)
  }
  if (gender) { where.push('gender = ?'); params.push(gender) }
  if (blood_group) { where.push('blood_group = ?'); params.push(blood_group) }

  const rows = await query(`SELECT SQL_CALC_FOUND_ROWS * FROM patients WHERE ${where.join(' AND ')} ORDER BY full_name LIMIT ? OFFSET ?`, [...params, parseInt(limit, 10), offset])
  const totalRows = await query('SELECT FOUND_ROWS() AS total')
  const total = totalRows[0]?.total || 0
  const pages = Math.ceil(total / parseInt(limit, 10))
  res.json({ data: rows, pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages } })
})

router.get('/:id', async (req, res) => {
  const rows = await query('SELECT * FROM patients WHERE id = ?', [req.params.id])
  if (!rows || rows.length === 0) return res.status(404).json({ message: 'Patient not found' })
  res.json({ data: rows[0] })
})

router.post('/', async (req, res) => {
  const payload = req.body
  const result = await query(`INSERT INTO patients (full_name, age, gender, blood_group, phone, email, address, city, state, allergies, medical_history, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      payload.full_name, payload.age, payload.gender, payload.blood_group, payload.phone,
      payload.email, payload.address, payload.city, payload.state,
      payload.allergies, payload.medical_history, 'active'
  ])
  const rows = await query('SELECT * FROM patients WHERE id = ?', [result.insertId])
  res.status(201).json({ data: rows[0] })
})

router.put('/:id', async (req, res) => {
  const payload = req.body
  await query(`UPDATE patients SET full_name = ?, age = ?, gender = ?, blood_group = ?, phone = ?, email = ?, address = ?, city = ?, state = ?, allergies = ?, medical_history = ? WHERE id = ?`, [
    payload.full_name, payload.age, payload.gender, payload.blood_group, payload.phone,
    payload.email, payload.address, payload.city, payload.state,
    payload.allergies, payload.medical_history, req.params.id
  ])
  const rows = await query('SELECT * FROM patients WHERE id = ?', [req.params.id])
  res.json({ data: rows[0] })
})

router.delete('/:id', async (req, res) => {
  await query('UPDATE patients SET status = ? WHERE id = ?', ['inactive', req.params.id])
  res.json({ message: 'Patient deactivated' })
})

module.exports = router
