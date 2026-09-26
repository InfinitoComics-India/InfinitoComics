import mongoose from 'mongoose';

const inventoryHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  change: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ['restock', 'damaged', 'returned', 'lost', 'correction', 'sale', 'other'],
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
inventoryHistorySchema.index({ product: 1, createdAt: -1 });

const InventoryHistory = mongoose.model('InventoryHistory', inventoryHistorySchema);
export default InventoryHistory;
