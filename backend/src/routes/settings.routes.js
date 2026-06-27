const router = require('express').Router()
const settingController = require('../controllers/setting.controller')

router.get('/', settingController.get)
router.put('/', settingController.update)

module.exports = router
