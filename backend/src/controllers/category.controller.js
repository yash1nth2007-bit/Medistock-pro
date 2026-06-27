const Category = require('../models/category.model')
const asyncHandler = require('../middleware/asyncHandler')

const getAll = asyncHandler(async (req, res) => {
  const categories = await Category.getAll()
  res.json({ data: categories })
})

module.exports = {
  getAll
}
