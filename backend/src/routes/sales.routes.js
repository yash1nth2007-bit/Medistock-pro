const router = require('express').Router()
const { query } = require('../config/database')

router.get('/', async (req, res) => {
  const { page = 1, limit = 20, search = '', from_date, to_date, payment_status = '' } = req.query
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
  const where = []
  const params = []

  if (search) {
    where.push('(invoice_number LIKE ? OR patient_name LIKE ? OR payment_method LIKE ?)')
    const term = `%${search}%`
    params.push(term, term, term)
  }
  if (payment_status) { where.push('payment_status = ?'); params.push(payment_status) }
  if (from_date) { where.push('DATE(sale_date) >= ?'); params.push(from_date) }
  if (to_date) { where.push('DATE(sale_date) <= ?'); params.push(to_date) }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const rows = await query(`SELECT SQL_CALC_FOUND_ROWS * FROM sales ${whereSql} ORDER BY sale_date DESC LIMIT ? OFFSET ?`, [...params, parseInt(limit, 10), offset])
  const totalRows = await query('SELECT FOUND_ROWS() AS total')
  const total = totalRows[0]?.total || 0
  const pages = Math.ceil(total / parseInt(limit, 10))
  res.json({ data: rows, pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages } })
})

router.get('/daily-report', async (req, res) => {
  const rows = await query(`SELECT
      COUNT(*) AS total_sales,
      SUM(total_amount) AS revenue,
      SUM(tax_amount) AS tax
    FROM sales
    WHERE DATE(sale_date) = CURDATE()`)
  res.json({ data: { summary: rows[0] || { total_sales:0, revenue:0, tax:0 } } })
})

router.post('/', async (req, res) => {
  const { patient_id, items, discount_percentage = 0, payment_method = 'cash', paid_amount = 0 } = req.body
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0), 0)
  const tax_amount = items.reduce((sum, item) => sum + ((parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0) * (parseFloat(item.gst_percentage) || 0) / 100), 0)
  const discount_amount = subtotal * (parseFloat(discount_percentage) || 0) / 100
  const total_amount = subtotal + tax_amount - discount_amount
  const [invoice] = await query("SELECT CONCAT('INV', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(COUNT(*) + 1, 4, '0')) AS invoice_number FROM sales")
  const result = await query(`INSERT INTO sales (invoice_number, patient_id, total_amount, tax_amount, discount_percentage, payment_method, paid_amount, payment_status, sale_date, sale_time, created_by_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_FORMAT(NOW(), '%H:%i:%s'), ?)`, [
      invoice.invoice_number, patient_id || null, total_amount, tax_amount, discount_percentage, payment_method, paid_amount,
      paid_amount >= total_amount ? 'paid' : 'partial', 'Guest User'
  ])

  await Promise.all(items.map(item => query(`INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, gst_percentage, discount_percentage)
    VALUES (?, ?, ?, ?, ?, ?)`, [result.insertId, item.medicine_id, item.quantity, item.unit_price, item.gst_percentage, item.discount_percentage || 0])))

  await Promise.all(items.map(item => query(`UPDATE medicines SET quantity = quantity - ? WHERE id = ?`, [item.quantity, item.medicine_id])))

  res.status(201).json({ data: { id: result.insertId, invoice_number: invoice.invoice_number } })
})

module.exports = router
