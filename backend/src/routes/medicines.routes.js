const router = require('express').Router()
const { query } = require('../config/database')

router.get('/', async (req, res) => {
  const { page = 1, limit = 20, search = '', category_id, expiry_status, low_stock, sort = 'name', order = 'ASC' } = req.query
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
  const where = ['status != ?']
  const params = ['discontinued']

  if (search) {
    where.push('(name LIKE ? OR generic_name LIKE ? OR barcode LIKE ? OR brand_name LIKE ?)')
    const term = `%${search}%`
    params.push(term, term, term, term)
  }
  if (category_id) {
    where.push('category_id = ?'); params.push(category_id)
  }
  if (expiry_status) {
    if (expiry_status === 'expired') where.push('expiry_date < CURDATE()')
    if (expiry_status === 'out') where.push('quantity = 0')
    if (expiry_status === 'near_30') where.push('DATEDIFF(expiry_date, CURDATE()) BETWEEN 0 AND 30')
    if (expiry_status === 'near_60') where.push('DATEDIFF(expiry_date, CURDATE()) BETWEEN 0 AND 60')
    if (expiry_status === 'near_90') where.push('DATEDIFF(expiry_date, CURDATE()) BETWEEN 0 AND 90')
  }
  if (low_stock === 'true') {
    where.push('quantity > 0 AND quantity <= reorder_level')
  }

  const rows = await query(`SELECT SQL_CALC_FOUND_ROWS m.*, c.name AS category_name,
      CASE
        WHEN quantity = 0 THEN 'out_of_stock'
        WHEN expiry_date < CURDATE() THEN 'expired'
        WHEN DATEDIFF(expiry_date, CURDATE()) BETWEEN 0 AND 30 THEN 'near_expiry'
        WHEN quantity <= reorder_level THEN 'low_stock'
        ELSE 'ok'
      END AS stock_status,
      DATEDIFF(expiry_date, CURDATE()) AS days_to_expiry
    FROM medicines m
    LEFT JOIN categories c ON c.id = m.category_id
    WHERE ${where.join(' AND ')}
    ORDER BY ${sort} ${order}
    LIMIT ? OFFSET ?`, [...params, parseInt(limit, 10), offset])
  const totalRows = await query('SELECT FOUND_ROWS() AS total')
  const total = totalRows[0]?.total || 0
  const pages = Math.ceil(total / parseInt(limit, 10))

  res.json({ data: rows, pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages } })
})

router.get('/search', async (req, res) => {
  const { q = '', limit = 10 } = req.query
  const term = `%${q}%`
  const rows = await query(`SELECT id, name, generic_name, selling_price, quantity, unit, gst_percentage, expiry_date
    FROM medicines WHERE status != 'discontinued' AND (name LIKE ? OR generic_name LIKE ? OR barcode LIKE ?)
    ORDER BY name LIMIT ?`, [term, term, term, parseInt(limit, 10)])
  res.json({ data: rows })
})

router.get('/:id', async (req, res) => {
  const rows = await query(`SELECT m.*, c.name AS category_name FROM medicines m LEFT JOIN categories c ON c.id = m.category_id WHERE m.id = ?`, [req.params.id])
  if (!rows || rows.length === 0) return res.status(404).json({ message: 'Medicine not found' })
  const history = await query(`SELECT id, 'sale' AS type, quantity_change * -1 AS quantity_change, NULL AS quantity_before, NULL AS quantity_after, 'Sale' AS reference_type, sale_id AS reference_id, created_at
    FROM sale_items WHERE medicine_id = ?
    UNION ALL
    SELECT id, 'purchase' AS type, quantity AS quantity_change, NULL, NULL, 'Purchase' AS reference_type, purchase_id AS reference_id, created_at
    FROM purchase_items WHERE medicine_id = ? ORDER BY created_at DESC LIMIT 20`, [req.params.id, req.params.id])
  res.json({ data: { ...rows[0], history } })
})

router.post('/', async (req, res) => {
  const payload = req.body
  const result = await query(`INSERT INTO medicines
    (name, generic_name, brand_name, manufacturer, category_id, batch_number, manufacturing_date, expiry_date, purchase_price, selling_price, gst_percentage, quantity, reorder_level, storage_conditions, description, unit, barcode, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      payload.name, payload.generic_name, payload.brand_name, payload.manufacturer, payload.category_id || null,
      payload.batch_number, payload.manufacturing_date || null, payload.expiry_date || null,
      payload.purchase_price || 0, payload.selling_price || 0, payload.gst_percentage || 0,
      payload.quantity || 0, payload.reorder_level || 0, payload.storage_conditions || null,
      payload.description || null, payload.unit || 'tablets', payload.barcode || null, payload.status || 'active'
    ])
  const rows = await query('SELECT * FROM medicines WHERE id = ?', [result.insertId])
  res.status(201).json({ data: rows[0] })
})

router.put('/:id', async (req, res) => {
  const payload = req.body
  await query(`UPDATE medicines SET name = ?, generic_name = ?, brand_name = ?, manufacturer = ?, category_id = ?, batch_number = ?, manufacturing_date = ?, expiry_date = ?, purchase_price = ?, selling_price = ?, gst_percentage = ?, quantity = ?, reorder_level = ?, storage_conditions = ?, description = ?, unit = ?, barcode = ?, status = ? WHERE id = ?`, [
    payload.name, payload.generic_name, payload.brand_name, payload.manufacturer, payload.category_id || null,
    payload.batch_number, payload.manufacturing_date || null, payload.expiry_date || null,
    payload.purchase_price || 0, payload.selling_price || 0, payload.gst_percentage || 0,
    payload.quantity || 0, payload.reorder_level || 0, payload.storage_conditions || null,
    payload.description || null, payload.unit || 'tablets', payload.barcode || null, payload.status || 'active', req.params.id
  ])
  const rows = await query('SELECT * FROM medicines WHERE id = ?', [req.params.id])
  res.json({ data: rows[0] })
})

router.delete('/:id', async (req, res) => {
  await query('UPDATE medicines SET status = ? WHERE id = ?', ['discontinued', req.params.id])
  res.json({ message: 'Medicine discontinued' })
})

module.exports = router
