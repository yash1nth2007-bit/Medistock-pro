const router = require('express').Router()

router.get('/stats', async (req, res) => {
  res.json({ data: { message: 'Admin stats endpoint is not available in public mode.' } })
})

router.get('/audit-logs', async (req, res) => {
  res.status(404).json({ message: 'Audit logs are not available.' })
})

router.get('/roles', async (req, res) => {
  res.status(404).json({ message: 'Roles endpoint is not available.' })
})

router.get('/users', async (req, res) => {
  res.status(404).json({ message: 'Users endpoint is not available.' })
})

module.exports = router
