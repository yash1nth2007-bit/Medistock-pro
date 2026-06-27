const router = require('express').Router()
const { query } = require('../config/database')

router.get('/sales', async (req, res) => {
  const params = []
  let filter = ''
  if (req.query.from_date) { filter += 'AND DATE(sale_date) >= ? '; params.push(req.query.from_date) }
  if (req.query.to_date) { filter += 'AND DATE(sale_date) <= ? '; params.push(req.query.to_date) }
  const rows = await query(`SELECT * FROM sales WHERE 1=1 ${filter} ORDER BY sale_date DESC LIMIT 200`, params)
  res.json({ data: rows })
})

router.get('/purchases', async (req, res) => {
  const params = []
  let filter = ''
  if (req.query.from_date) { filter += 'AND DATE(purchase_date) >= ? '; params.push(req.query.from_date) }
  if (req.query.to_date) { filter += 'AND DATE(purchase_date) <= ? '; params.push(req.query.to_date) }
  const rows = await query(`SELECT * FROM purchases WHERE 1=1 ${filter} ORDER BY purchase_date DESC LIMIT 200`, params)
  res.json({ data: rows })
})

router.get('/inventory', async (req, res) => {
  const rows = await query(`SELECT m.id, m.name, m.generic_name, c.name AS category_name, m.quantity, m.unit, m.selling_price, m.status,
      CASE
        WHEN m.quantity = 0 THEN 'out_of_stock'
        WHEN m.quantity <= m.reorder_level THEN 'low_stock'
        WHEN m.expiry_date < CURDATE() THEN 'expired'
        ELSE 'ok'
      END AS stock_status
    FROM medicines m
    LEFT JOIN categories c ON c.id = m.category_id
    ORDER BY m.name LIMIT 200`)
  res.json({ data: rows })
})

router.get('/expiry', async (req, res) => {
  const days = parseInt(req.query.days || '0', 10)
  const rows = await query(`SELECT m.id, m.name, m.medicine_id, m.batch_number, m.expiry_date, m.quantity, m.unit, m.selling_price,
      DATEDIFF(expiry_date, CURDATE()) AS days_left
    FROM medicines m
    WHERE expiry_date IS NOT NULL AND DATEDIFF(expiry_date, CURDATE()) <= ?
    ORDER BY expiry_date ASC LIMIT 200`, [days])
  res.json({ data: rows })
})

module.exports = router
