const router = require('express').Router()

router.use('/dashboard', require('./dashboard.routes'))
router.use('/medicines', require('./medicines.routes'))
router.use('/categories', require('./categories.routes'))
router.use('/suppliers', require('./suppliers.routes'))
router.use('/patients', require('./patients.routes'))
// router.use('/sales', require('./sales.routes'))
router.use('/purchases', require('./purchases.routes'))
router.use('/reports', require('./reports.routes'))
// router.use('/notifications', require('./notifications.routes'))
router.use('/doctors', require('./doctors.routes'))
router.use('/prescriptions', require('./prescriptions.routes'))
router.use('/settings', require('./settings.routes'))
router.use('/admin', require('./admin.routes'))

module.exports = router
