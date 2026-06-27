const Prescription = require('../models/prescription.model')
const asyncHandler = require('../middleware/asyncHandler')

const getAll = asyncHandler(async (req, res) => {
  const result = await Prescription.findAll(req.query)
  res.json(result)
})

const create = asyncHandler(async (req, res) => {
  const prescription = await Prescription.create(req.body)
  res.status(201).json({ data: prescription })
})

module.exports = {
  getAll,
  create
}
