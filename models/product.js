const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  sku: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Text index for searching
productSchema.index({ name: 'text', sku: 'text', description: 'text' });

// Static search method
productSchema.statics.search = async function(searchTerm, filters = {}, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  
  const query = {
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { sku: new RegExp(searchTerm, 'i') }
    ]
  };
  
  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
  }
  
  const [results, total] = await Promise.all([
    this.find(query)
      .skip(skip)
      .limit(limit)
      .populate('category')
      .sort({ name: 1 }),
    this.countDocuments(query)
  ]);
  
  return {
    results,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// Get search statistics
productSchema.statics.getSearchStats = async function(searchTerm) {
  const stats = {};
  
  // Total matches
  stats.totalMatches = await this.countDocuments({
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { sku: new RegExp(searchTerm, 'i') }
    ]
  });
  
  // Price range
  const priceAggregation = await this.aggregate([
    {
      $match: {
        $or: [
          { name: new RegExp(searchTerm, 'i') },
          { sku: new RegExp(searchTerm, 'i') }
        ]
      }
    },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);
  
  stats.priceRange = priceAggregation[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 };
  
  // Popular categories
  stats.popularCategories = await this.aggregate([
    {
      $match: {
        $or: [
          { name: new RegExp(searchTerm, 'i') },
          { sku: new RegExp(searchTerm, 'i') }
        ]
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 3 },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' }
  ]);
  
  return stats;
};

module.exports = mongoose.model('Product', productSchema);