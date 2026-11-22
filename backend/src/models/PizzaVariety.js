const mongoose = require('mongoose');

const pizzaVarietySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide pizza name'],
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    defaultBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    },
    defaultSauce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    },
    defaultCheese: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    },
    defaultVeggies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem',
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PizzaVariety', pizzaVarietySchema);

