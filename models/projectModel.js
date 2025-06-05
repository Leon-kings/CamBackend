const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: true, text: true },
  description: { type: String, text: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  createdAt: { type: Date, default: Date.now }
});

// Create text index for search
projectSchema.index({
  name: 'text',
  description: 'text'
});

const Project = mongoose.model('Project', projectSchema);

// Create text index if it doesn't exist
Project.init().then(() => {
  console.log('Text indexes created for Project model');
}).catch(err => {
  console.error('Error creating text indexes:', err);
});

module.exports = Project;