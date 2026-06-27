const router = require('express').Router()
const notificationController = require('../controllers/notification.controller')

router.get('/', notificationController.getAll)
router.put('/read-all', notificationController.markAllAsRead)
router.put('/:id/read', notificationController.markAsRead)

module.exports = router
