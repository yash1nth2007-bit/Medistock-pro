const router = require('express').Router()
const { query } = require('../config/database')

router.get('/', async (req, res) => {
  const { page = 1, limit = 20, search = '', specialization = '' } = req.query
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
  const where = ['status != ?']
  const params = ['inactive']

  if (search) {
    where.push('(full_name LIKE ? OR specialization LIKE ? OR phone LIKE ?)')
    const term = `%${search}%`
    params.push(term, term, term)
  }
  if (specialization) { where.push('specialization = ?'); params.push(specialization) }

  const rows = await query(`SELECT SQL_CALC_FOUND_ROWS * FROM doctors WHERE ${where.join(' AND ')} ORDER BY full_name LIMIT ? OFFSET ?`, [...params, parseInt(limit, 10), offset])
  const totalRows = await query('SELECT FOUND_ROWS() AS total')
  const total = totalRows[0]?.total || 0
  const pages = Math.ceil(total / parseInt(limit, 10))
  res.json({ data: rows, pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages } })
})

router.post('/', async (req, res) => {
  const payload = req.body
  const result = await query(`INSERT INTO doctors (full_name, specialization, qualification, experience_years, phone, email, license_number, consultation_fee, bio, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      payload.full_name, payload.specialization, payload.qualification, payload.experience_years,
      payload.phone, payload.email, payload.license_number, payload.consultation_fee, payload.bio, 'active'
  ])
  const rows = await query('SELECT * FROM doctors WHERE id = ?', [result.insertId])
  res.status(201).json({ data: rows[0] })
})

router.put('/:id', async (req, res) => {
  const payload = req.body
  await query(`UPDATE doctors SET full_name = ?, specialization = ?, qualification = ?, experience_years = ?, phone = ?, email = ?, license_number = ?, consultation_fee = ?, bio = ? WHERE id = ?`, [
    payload.full_name, payload.specialization, payload.qualification, payload.experience_years,
    payload.phone, payload.email, payload.license_number, payload.consultation_fee, payload.bio, req.params.id
  ])
  const rows = await query('SELECT * FROM doctors WHERE id = ?', [req.params.id])
  res.json({ data: rows[0] })
})

router.delete('/:id', async (req, res) => {
  await query('UPDATE doctors SET status = ? WHERE id = ?', ['inactive', req.params.id])
  res.json({ message: 'Doctor deactivated' })
})

module.exports = router
