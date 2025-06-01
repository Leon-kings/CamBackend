const mongoose = require('mongoose');

const viewStatSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  count: { type: Number, default: 0 }
});

const viewCountSchema = new mongoose.Schema({
  pageId: { 
    type: String, 
    required: true, 
    unique: true,
    default: '1' // Default to track index page
  },
  totalCount: { type: Number, default: 1 },
  dailyStats: [viewStatSchema],
  weeklyStats: [viewStatSchema],
  monthlyStats: [viewStatSchema],
  yearlyStats: [viewStatSchema],
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
viewCountSchema.index({ pageId: 1 });
viewCountSchema.index({ 'dailyStats.date': 1 });
viewCountSchema.index({ 'weeklyStats.date': 1 });
viewCountSchema.index({ 'monthlyStats.date': 1 });
viewCountSchema.index({ 'yearlyStats.date': 1 });

const ViewCount = mongoose.model('ViewCount', viewCountSchema);

module.exports = ViewCount;