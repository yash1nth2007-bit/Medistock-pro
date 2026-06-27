const { query } = require('../config/database')

const Dashboard = {
  getStats: async () => {
    const medicinesRow = await query(`SELECT
        SUM(CASE WHEN status != 'discontinued' THEN 1 ELSE 0 END) AS total,
        SUM(CASE WHEN status != 'discontinued' AND quantity = 0 THEN 1 ELSE 0 END) AS out_of_stock,
        SUM(CASE WHEN status != 'discontinued' AND quantity <= reorder_level AND quantity > 0 THEN 1 ELSE 0 END) AS low_stock,
        SUM(CASE WHEN status != 'discontinued' AND expiry_date IS NOT NULL AND DATEDIFF(expiry_date, CURDATE()) BETWEEN 0 AND 30 THEN 1 ELSE 0 END) AS near_expiry
      FROM medicines`)
    const medicines = medicinesRow[0] || { total: 0, out_of_stock: 0, low_stock: 0, near_expiry: 0 }

    const salesRow = await query(`SELECT
        SUM(total_amount) AS this_month,
        SUM(CASE WHEN DATE(sale_date) = CURDATE() THEN total_amount ELSE 0 END) AS today_revenue
      FROM sales
      WHERE MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())`)
    const sales = salesRow[0] || { this_month: 0, today_revenue: 0 }

    const purchasesRow = await query(`SELECT SUM(total_amount) AS this_month FROM purchases WHERE MONTH(purchase_date) = MONTH(CURDATE()) AND YEAR(purchase_date) = YEAR(CURDATE())`)
    const purchases = purchasesRow[0] || { this_month: 0 }

    const patientsRow = await query(`SELECT COUNT(*) AS total FROM patients WHERE status != 'inactive'`)
    const patients = patientsRow[0] || { total: 0 }

    const doctorsRow = await query(`SELECT COUNT(*) AS total FROM doctors WHERE status != 'inactive'`)
    const doctors = doctorsRow[0] || { total: 0 }

    const monthlySales = await query(`SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month, SUM(total_amount) AS revenue, COUNT(*) AS count FROM sales GROUP BY month ORDER BY month DESC LIMIT 12`)
    const monthlyPurchases = await query(`SELECT DATE_FORMAT(purchase_date, '%Y-%m') AS month, SUM(total_amount) AS amount FROM purchases GROUP BY month ORDER BY month DESC LIMIT 12`)
    const categoryBreakdown = await query(`SELECT c.id, c.name, COUNT(m.id) AS count FROM categories c LEFT JOIN medicines m ON m.category_id = c.id AND m.status != 'discontinued' GROUP BY c.id, c.name ORDER BY count DESC LIMIT 8`)
    const lowStockMedicines = await query(`SELECT id, name, quantity, reorder_level, unit FROM medicines WHERE status != 'discontinued' AND quantity > 0 AND quantity <= reorder_level ORDER BY quantity ASC LIMIT 5`)
    const nearExpiryMedicines = await query(`SELECT id, name, expiry_date, quantity, unit, DATEDIFF(expiry_date, CURDATE()) AS days_left FROM medicines WHERE status != 'discontinued' AND expiry_date IS NOT NULL AND DATEDIFF(expiry_date, CURDATE()) BETWEEN 0 AND 30 ORDER BY expiry_date ASC LIMIT 5`)
    const recentSales = await query(`SELECT invoice_number, patient_name, total_amount, payment_method, sale_date, created_by_name FROM sales ORDER BY sale_date DESC LIMIT 5`)

    return {
      medicines,
      sales,
      purchases,
      patients,
      doctors,
      charts: {
        monthly_sales: monthlySales.reverse(),
        monthly_purchases: monthlyPurchases.reverse(),
        category_breakdown: categoryBreakdown
      },
      low_stock_medicines: lowStockMedicines,
      near_expiry_medicines: nearExpiryMedicines,
      recent_sales: recentSales
    }
  }
}

module.exports = Dashboard
