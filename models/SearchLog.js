const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  term: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: String,
  filters: Object,
  resultCount: Number,
  createdAt: { type: Date, default: Date.now, index: true }
});

// Log a search
searchLogSchema.statics.logSearch = async function(term, user, ipAddress, filters, resultCount) {
  return this.create({
    term,
    user,
    ipAddress,
    filters,
    resultCount
  });
};

// Get search frequency
searchLogSchema.statics.getSearchFrequency = async function(term) {
  return this.countDocuments({ term: new RegExp(term, 'i') });
};

// Get popular searches
searchLogSchema.statics.getPopularSearches = async function(limit = 10) {
  return this.aggregate([
    { $group: { _id: '$term', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Get recent searches
searchLogSchema.statics.getRecentSearches = async function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('term createdAt')
    .exec();
};

module.exports = mongoose.model('SearchLog', searchLogSchema);