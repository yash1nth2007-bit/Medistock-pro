const router = require('express').Router()
const { query } = require('../config/database')

router.get('/', async (req, res) => {
  const { page = 1, limit = 20, search = '', from_date, to_date, status = '' } = req.query
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
  const where = []
  const params = []

  if (search) {
    where.push('(purchase_number LIKE ? OR supplier_name LIKE ?)')
    const term = `%${search}%`
    params.push(term, term)
  }
  if (status) { where.push('status = ?'); params.push(status) }
  if (from_date) { where.push('DATE(purchase_date) >= ?'); params.push(from_date) }
  if (to_date) { where.push('DATE(purchase_date) <= ?'); params.push(to_date) }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const rows = await query(`SELECT SQL_CALC_FOUND_ROWS * FROM purchases ${whereSql} ORDER BY purchase_date DESC LIMIT ? OFFSET ?`, [...params, parseInt(limit, 10), offset])
  const totalRows = await query('SELECT FOUND_ROWS() AS total')
  const total = totalRows[0]?.total || 0
  const pages = Math.ceil(total / parseInt(limit, 10))
  res.json({ data: rows, pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages } })
})

router.post('/', async (req, res) => {
  const { supplier_id, purchase_date, invoice_number, payment_method, notes, items } = req.body
  if (!supplier_id || !items?.length) return res.status(400).json({ message: 'Supplier and items are required' })

  const [supplier] = await query('SELECT name FROM suppliers WHERE id = ?', [supplier_id])
  const supplier_name = supplier?.name || ''
  const total_amount = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0), 0)

  const result = await query(`INSERT INTO purchases (supplier_id, supplier_name, purchase_number, purchase_date, invoice_number, payment_method, total_amount, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      supplier_id, supplier_name, `PO${Date.now()}`, purchase_date || new Date().toISOString().split('T')[0], invoice_number || null,
      payment_method || 'cash', total_amount, 'received', notes || null
  ])

  await Promise.all(items.map(item => query(`INSERT INTO purchase_items (purchase_id, medicine_id, quantity, unit_price, gst_percentage, batch_number, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)`, [result.insertId, item.medicine_id, item.quantity, item.unit_price, item.gst_percentage, item.batch_number || null, item.expiry_date || null])))

  await Promise.all(items.map(item => query(`UPDATE medicines SET quantity = quantity + ? WHERE id = ?`, [item.quantity, item.medicine_id])))

  res.status(201).json({ data: { id: result.insertId, purchase_number: `PO${Date.now()}` } })
})

module.exports = router
