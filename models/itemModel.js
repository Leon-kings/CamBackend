const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, text: true },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  description: { type: String, text: true },
  tags: [{ type: String, text: true }],
  createdAt: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now },
  relatedProject: { type: Schema.Types.ObjectId, ref: 'Project' }
}, { 
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Create text index for search
itemSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  id: 'text'
});

// Update lastAccessed timestamp
itemSchema.pre(/^find/, function(next) {
  if (this._conditions.id || this._conditions._id) {
    this.model.updateOne(
      { $or: [{ id: this._conditions.id }, { _id: this._conditions._id }] },
      { lastAccessed: Date.now() }
    ).exec();
  }
  next();
});

const Item = mongoose.model('Item', itemSchema);

// Create text index if it doesn't exist
Item.init().then(() => {
  console.log('Text indexes created for Item model');
}).catch(err => {
  console.error('Error creating text indexes:', err);
});

module.exports = Item;