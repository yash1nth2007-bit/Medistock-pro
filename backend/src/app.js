const express = require('express')
require('express-async-errors')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const apiRoutes = require('./routes/api.routes')
const errorHandler = require('./middleware/error.middleware')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 204
}))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', apiRoutes)
app.use(errorHandler)

module.exports = app
