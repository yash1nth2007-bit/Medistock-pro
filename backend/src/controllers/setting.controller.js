const Setting = require('../models/setting.model')
const asyncHandler = require('../middleware/asyncHandler')

const get = asyncHandler(async (req, res) => {
  const setting = await Setting.get()
  res.json({ data: setting || {} })
})

const update = asyncHandler(async (req, res) => {
  const setting = await Setting.update(req.body)
  res.json({ data: setting || {} })
})

module.exports = {
  get,
  update
}
