const router = require('express').Router()
const prescriptionController = require('../controllers/prescription.controller')

router.get('/', prescriptionController.getAll)
router.post('/', prescriptionController.create)

module.exports = router
