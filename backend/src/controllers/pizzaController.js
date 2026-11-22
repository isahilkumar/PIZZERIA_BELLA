const PizzaVariety = require('../models/PizzaVariety');

exports.getPizzaVarieties = async (req, res) => {
  try {
    const pizzas = await PizzaVariety.find({ isAvailable: true })
      .populate('defaultBase')
      .populate('defaultSauce')
      .populate('defaultCheese')
      .populate('defaultVeggies');

    res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pizza varieties',
    });
  }
};

exports.createPizzaVariety = async (req, res) => {
  try {
    const pizza = await PizzaVariety.create(req.body);
    res.status(201).json({
      success: true,
      pizza,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create pizza variety',
    });
  }
};

exports.updatePizzaVariety = async (req, res) => {
  try {
    const pizza = await PizzaVariety.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }
    res.status(200).json({
      success: true,
      pizza,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update pizza variety',
    });
  }
};

exports.deletePizzaVariety = async (req, res) => {
  try {
    const pizza = await PizzaVariety.findByIdAndDelete(req.params.id);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Pizza variety removed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete pizza variety',
    });
  }
};

