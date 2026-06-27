const { query } = require('../config/database')

const Category = {
  getAll: async () => {
    return await query('SELECT id, name FROM categories ORDER BY name')
  }
}

module.exports = Category
