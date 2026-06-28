const { Pool } = require('pg')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../../.env.example'), override: false })

let lastFoundRows = 0

// SSL Configuration for Neon/PostgreSQL
const sslConfig = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('sslmode=require') || process.env.DATABASE_URL.includes('neon.tech'))
  ? { rejectUnauthorized: false }
  : false

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
  max: 20, // Connection pooling limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Convert MySQL "?" placeholders to PostgreSQL "$1", "$2", etc.
function convertPlaceholders(sql) {
  let paramIndex = 1
  let inSingleQuote = false
  let inDoubleQuote = false
  let result = ''
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    if (char === "'" && (i === 0 || sql[i - 1] !== '\\')) {
      inSingleQuote = !inSingleQuote
      result += char
    } else if (char === '"' && (i === 0 || sql[i - 1] !== '\\')) {
      inDoubleQuote = !inDoubleQuote
      result += char
    } else if (char === '?' && !inSingleQuote && !inDoubleQuote) {
      result += `$${paramIndex++}`
    } else {
      result += char
    }
  }
  return result
}

const query = async (sql, params = []) => {
  const sqlTrimmed = sql.trim()
  const isSelect = sqlTrimmed.toLowerCase().startsWith('select')

  if (isSelect) {
    if (sqlTrimmed.includes('SQL_CALC_FOUND_ROWS')) {
      const cleanSql = sql.replace(/SQL_CALC_FOUND_ROWS\s+/i, '')
      
      // Emulate MySQL SQL_CALC_FOUND_ROWS and FOUND_ROWS()
      const match = cleanSql.match(/LIMIT\s+([?\d$]+)(?:\s+OFFSET\s+([?\d$]+))?/i)
      let cleanSqlForCount = cleanSql
      let countParams = [...params]
      
      if (match) {
        cleanSqlForCount = cleanSql.replace(/LIMIT\s+[?\d$]+(?:\s+OFFSET\s+[?\d$]+)?/i, '')
        let placeholdersToRemove = 0
        const limitOffsetPart = match[0]
        const questionMarks = (limitOffsetPart.match(/\?/g) || []).length
        if (questionMarks > 0) {
          placeholdersToRemove = questionMarks
        }
        if (placeholdersToRemove > 0) {
          countParams = countParams.slice(0, countParams.length - placeholdersToRemove)
        }
      }
      
      try {
        const countSql = `SELECT COUNT(*) AS total FROM (${cleanSqlForCount}) AS subquery_count`
        const convertedCountSql = convertPlaceholders(countSql)
        const countRes = await pool.query(convertedCountSql, countParams)
        lastFoundRows = countRes.rows[0] ? parseInt(countRes.rows[0].total, 10) : 0
      } catch (e) {
        console.warn('Count query failed emulation:', e.message, cleanSqlForCount)
      }
      
      const convertedSql = convertPlaceholders(cleanSql)
      const res = await pool.query(convertedSql, params)
      return res.rows
    } else if (/SELECT\s+FOUND_ROWS\(\)/i.test(sqlTrimmed)) {
      return [{ total: lastFoundRows }]
    } else {
      const convertedSql = convertPlaceholders(sql)
      const res = await pool.query(convertedSql, params)
      return res.rows
    }
  } else {
    let finalSql = sql
    const isInsert = sqlTrimmed.toLowerCase().startsWith('insert')
    
    // Automatically append RETURNING id to INSERT statements to fetch inserted ID
    if (isInsert && !sqlTrimmed.toLowerCase().includes('returning')) {
      finalSql = `${sql.trim()} RETURNING id`
    }
    
    const convertedSql = convertPlaceholders(finalSql)
    const res = await pool.query(convertedSql, params)
    
    const insertId = isInsert && res.rows[0] ? res.rows[0].id : null
    return {
      insertId: insertId,
      affectedRows: res.rowCount,
      changedRows: res.rowCount
    }
  }
}

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT 1 + 1 AS result')
    return res.rows[0].result === 2
  } catch (err) {
    console.error('❌ PostgreSQL database connection test failed:', err.message)
    throw err
  }
}

module.exports = { pool, query, testConnection }
