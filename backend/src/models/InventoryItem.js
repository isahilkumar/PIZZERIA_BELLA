const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: ['base', 'sauce', 'cheese', 'veggie'],
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please specify price (can be 0 for included items)'],
      default: 0,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Please specify stock quantity'],
      default: 50,
      min: 0,
    },
    threshold: {
      type: Number,
      required: true,
      default: 20,
      min: 1,
    },
    unit: {
      type: String,
      default: 'units',
    },
    badge: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if currently low stock
inventoryItemSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity < this.threshold;
});

inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);

