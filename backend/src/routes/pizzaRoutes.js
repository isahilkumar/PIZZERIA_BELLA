const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizzaController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', pizzaController.getPizzaVarieties);
router.post('/', protect, adminOnly, pizzaController.createPizzaVariety);
router.put('/:id', protect, adminOnly, pizzaController.updatePizzaVariety);
router.delete('/:id', protect, adminOnly, pizzaController.deletePizzaVariety);

module.exports = router;

