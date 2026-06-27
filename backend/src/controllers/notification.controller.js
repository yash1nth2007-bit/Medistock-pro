const Notification = require('../models/notification.model')
const asyncHandler = require('../middleware/asyncHandler')

const getAll = asyncHandler(async (req, res) => {
  const result = await Notification.findAll(req.query)
  res.json(result)
})

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.markAsRead(req.params.id)
  res.json({ message: 'Notification marked as read' })
})

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.markAllAsRead()
  res.json({ message: 'All notifications marked read' })
})

module.exports = {
  getAll,
  markAsRead,
  markAllAsRead
}
