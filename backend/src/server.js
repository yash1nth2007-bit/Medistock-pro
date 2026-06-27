const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env.example'), override: false })

const app = require('./app')
const { testConnection } = require('./config/database')

const PORT = process.env.PORT || 5000

const start = async () => {
  try {
    try {
      await testConnection()
      console.log('✅ Database connected successfully')
    } catch (dbError) {
      console.warn('⚠️  Warning: Could not connect to database:', dbError.message)
      console.warn('⚠️  Server will start without database. Some features may be limited.')
    }

    app.listen(PORT, () => {
      console.log(`Backend API running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  }
}

start()

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received — shutting down gracefully')
  process.exit(0)
})
