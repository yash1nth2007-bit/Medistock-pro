const mysql = require('mysql2/promise')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../../.env.example'), override: false })

let pool = null
let sqliteDb = null
let useSQLite = false
let lastFoundRows = 0

// Setup MySQL configuration
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medistock_pro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  decimalNumbers: true,
}

// Custom wrapper to parse JSON columns from SQLite results
function parseJsonColumns(rows) {
  if (!Array.isArray(rows)) return rows
  return rows.map(row => {
    if (!row) return row
    const newRow = { ...row }
    for (const key in newRow) {
      const val = newRow[key]
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try {
          newRow[key] = JSON.parse(val)
        } catch (e) {
          // Leave as string if not valid JSON
        }
      }
    }
    return newRow
  })
}

// Translate MySQL DDL to SQLite DDL
function translateSchema(sql) {
  return sql
    .replace(/INT\s+AUTO_INCREMENT\s+PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/INT\s+AUTO_INCREMENT/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
}

// Try connecting to MySQL. If fails, setup SQLite.
const initializeDatabase = () => {
  try {
    pool = mysql.createPool(mysqlConfig)
    console.log('Attempting MySQL connection...')
  } catch (err) {
    setupSQLiteFallback(err)
  }
}

const setupSQLiteFallback = (err) => {
  console.warn('⚠️  MySQL Connection Initialization failed:', err.message)
  console.log('⚙️  Falling back to in-memory native SQLite database...')
  
  try {
    const { DatabaseSync } = require('node:sqlite')
    sqliteDb = new DatabaseSync(':memory:')
    sqliteDb.exec('PRAGMA foreign_keys = ON;')

    // Define MySQL compatibility functions
    sqliteDb.function('CURDATE', () => {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })

    sqliteDb.function('NOW', () => {
      return new Date().toISOString().slice(0, 19).replace('T', ' ')
    })

    sqliteDb.function('DATEDIFF', (date1, date2) => {
      if (!date1 || !date2) return null
      const d1 = new Date(date1)
      const d2 = new Date(date2)
      if (isNaN(d1) || isNaN(d2)) return null
      d1.setHours(12, 0, 0, 0)
      d2.setHours(12, 0, 0, 0)
      const diffTime = d1 - d2
      return Math.round(diffTime / (1000 * 60 * 60 * 24))
    })

    sqliteDb.function('MONTH', (dateStr) => {
      if (!dateStr) return null
      const d = new Date(dateStr)
      if (isNaN(d)) return null
      return d.getMonth() + 1
    })

    sqliteDb.function('YEAR', (dateStr) => {
      if (!dateStr) return null
      const d = new Date(dateStr)
      if (isNaN(d)) return null
      return d.getFullYear()
    })

    sqliteDb.function('DATE', (dateStr) => {
      if (!dateStr) return null
      const d = new Date(dateStr)
      if (isNaN(d)) return null
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })

    sqliteDb.function('DATE_FORMAT', (dateStr, format) => {
      if (!dateStr) return null
      const d = new Date(dateStr)
      if (isNaN(d)) return null
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const date = String(d.getDate()).padStart(2, '0')
      if (format === '%Y-%m') return `${year}-${month}`
      if (format === '%Y-%m-%d') return `${year}-${month}-${date}`
      return dateStr
    })

    // Load and execute schema
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql')
    const seedsPath = path.resolve(__dirname, '../../../database/seeds.sql')
    
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8')
      sqliteDb.exec(translateSchema(schemaSql))
    }
    
    if (fs.existsSync(seedsPath)) {
      const seedsSql = fs.readFileSync(seedsPath, 'utf8')
      sqliteDb.exec(seedsSql)
    }

    useSQLite = true
    console.log('✅ SQLite fallback initialized successfully with schema and seed data.')
  } catch (sqliteErr) {
    console.error('❌ Failed to initialize SQLite fallback:', sqliteErr.message)
    throw sqliteErr
  }
}

initializeDatabase()

const query = async (sql, params = []) => {
  if (!useSQLite) {
    try {
      const [rows] = await pool.query(sql, params)
      return rows
    } catch (err) {
      if (!sqliteDb) {
        setupSQLiteFallback(err)
        return query(sql, params)
      }
      throw err
    }
  }

  // SQLite execution
  const sqlTrimmed = sql.trim()
  const isSelect = sqlTrimmed.toLowerCase().startsWith('select')

  if (isSelect) {
    if (sqlTrimmed.includes('SQL_CALC_FOUND_ROWS')) {
      const cleanSql = sql.replace(/SQL_CALC_FOUND_ROWS\s+/i, '')
      
      // Calculate total rows for FOUND_ROWS() emulation
      const match = cleanSql.match(/LIMIT\s+([?\d]+)(?:\s+OFFSET\s+([?\d]+))?/i)
      let cleanSqlForCount = cleanSql
      let countParams = [...params]
      
      if (match) {
        cleanSqlForCount = cleanSql.replace(/LIMIT\s+[?\d]+(?:\s+OFFSET\s+[?\d]+)?/i, '')
        let placeholdersToRemove = 0
        if (match[1] === '?') placeholdersToRemove++
        if (match[2] === '?') placeholdersToRemove++
        
        if (placeholdersToRemove > 0) {
          countParams = countParams.slice(0, countParams.length - placeholdersToRemove)
        }
      }
      
      try {
        const countSql = `SELECT COUNT(*) AS total FROM (${cleanSqlForCount})`
        const countStmt = sqliteDb.prepare(countSql)
        const countRes = countStmt.get(...countParams)
        lastFoundRows = countRes ? countRes.total : 0
      } catch (e) {
        console.warn('Count query failed:', e.message, cleanSqlForCount)
      }
      
      const stmt = sqliteDb.prepare(cleanSql)
      const rows = stmt.all(...params)
      return parseJsonColumns(rows)
    } else if (/SELECT\s+FOUND_ROWS\(\)/i.test(sqlTrimmed)) {
      return [{ total: lastFoundRows }]
    } else {
      const stmt = sqliteDb.prepare(sql)
      const rows = stmt.all(...params)
      return parseJsonColumns(rows)
    }
  } else {
    // INSERT, UPDATE, DELETE, etc.
    const stmt = sqliteDb.prepare(sql)
    const res = stmt.run(...params)
    return {
      insertId: res.lastInsertRowid,
      affectedRows: res.changes,
      changedRows: res.changes
    }
  }
}

const testConnection = async () => {
  if (useSQLite) return true
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result')
    return rows[0].result === 2
  } catch (err) {
    if (!sqliteDb) {
      setupSQLiteFallback(err)
      return true
    }
    return false
  }
}

module.exports = { pool, query, testConnection }
