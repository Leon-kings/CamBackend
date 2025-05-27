const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  orderDetails: {
    planId: { type: Number, required: true },
    planName: { type: String, required: true },
    cameraCount: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    features: { type: [String], required: true }
  },
  payment: {
    status: { type: String, default: 'pending' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ 'orderDetails.planId': 1 });

module.exports = mongoose.model('Order', OrderSchema);