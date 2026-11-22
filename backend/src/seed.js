require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const InventoryItem = require('./models/InventoryItem');
const PizzaVariety = require('./models/PizzaVariety');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pizza_delivery');
    console.log('✅ Connected to MongoDB for seeding');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();

  try {
    console.log('🧹 Cleaning existing seed collections...');
    await User.deleteMany({ email: { $in: ['admin@pizzadelivery.com', 'user@example.com'] } });
    await InventoryItem.deleteMany({});
    await PizzaVariety.deleteMany({});

    console.log('👤 Seeding Users & Admin...');
    // Seed Admin
    const admin = await User.create({
      name: 'Executive Chef (Admin)',
      email: 'admin@pizzadelivery.com',
      password: 'Admin@123456',
      role: 'admin',
      isVerified: true,
    });
    console.log(`  - Admin created: ${admin.email}`);

    // Seed Verified Default User
    const user = await User.create({
      name: 'Mario Rossi',
      email: 'user@example.com',
      password: 'User@123456',
      role: 'user',
      isVerified: true,
    });
    console.log(`  - Verified Customer created: ${user.email}`);

    console.log('📦 Seeding Inventory Items (Bases, Sauces, Cheeses, Veggies)...');

    // 1. BASES (5 Options)
    const basesData = [
      {
        name: 'Hand Tossed Thin Crust',
        category: 'base',
        description: 'Crisp exterior with an airy, tender interior fermented for 48 hours.',
        price: 120,
        stockQuantity: 45,
        threshold: 20,
        badge: 'Classic',
      },
      {
        name: 'Deep Dish Pan Crust',
        category: 'base',
        description: 'Thick, buttery crust with caramelized golden edges baked in seasoned steel pans.',
        price: 150,
        stockQuantity: 30,
        threshold: 20,
        badge: 'Popular',
      },
      {
        name: 'Cheese Burst Crust',
        category: 'base',
        description: 'Molten blend of artisanal cheese stuffed right into the crust rim.',
        price: 190,
        stockQuantity: 18, // Intentionally low for alert demo
        threshold: 20,
        badge: 'Chef Pick',
      },
      {
        name: 'Gluten-Free Cauliflower Crust',
        category: 'base',
        description: 'Crispy herb-seasoned crust crafted from cauliflower and ancient grains.',
        price: 180,
        stockQuantity: 28,
        threshold: 15,
        badge: 'Gluten-Free',
      },
      {
        name: 'Whole Wheat Sourdough Crust',
        category: 'base',
        description: 'Naturally leavened sourdough with stone-ground whole wheat and mild tang.',
        price: 160,
        stockQuantity: 35,
        threshold: 20,
        badge: 'Healthy',
      },
    ];

    // 2. SAUCES (5 Options)
    const saucesData = [
      {
        name: 'Classic San Marzano Tomato',
        category: 'sauce',
        description: 'D.O.P. Italian plum tomatoes crushed with sea salt, garlic, and fresh basil.',
        price: 30,
        stockQuantity: 50,
        threshold: 20,
        badge: 'Authentic',
      },
      {
        name: 'Creamy Garlic Alfredo',
        category: 'sauce',
        description: 'Velvety sauce made with roasted garlic, sweet cream, and aged parmesan.',
        price: 45,
        stockQuantity: 32,
        threshold: 20,
        badge: 'Rich',
      },
      {
        name: 'Spicy Peri Peri Marinara',
        category: 'sauce',
        description: 'Slow-simmered tomato sauce infused with African bird’s eye chili and paprika.',
        price: 40,
        stockQuantity: 28,
        threshold: 20,
        badge: 'Hot 🌶️',
      },
      {
        name: 'Basil Pesto Genovese',
        category: 'sauce',
        description: 'Aromatic crushed Genovese basil, pine nuts, garlic, and extra virgin olive oil.',
        price: 50,
        stockQuantity: 16, // Low stock demo
        threshold: 20,
        badge: 'Artisanal',
      },
      {
        name: 'Smoky Chipotle BBQ',
        category: 'sauce',
        description: 'Slow-smoked hickory barbecue sauce with chipotle pepper undertones.',
        price: 40,
        stockQuantity: 40,
        threshold: 20,
        badge: 'Smoky',
      },
    ];

    // 3. CHEESES
    const cheesesData = [
      {
        name: 'Fresh Fior di Latte Mozzarella',
        category: 'cheese',
        description: 'Traditional whole milk mozzarella that melts into creamy, stretchy perfection.',
        price: 60,
        stockQuantity: 60,
        threshold: 25,
        badge: 'Signature',
      },
      {
        name: 'Sharp Aged Cheddar',
        category: 'cheese',
        description: 'Rich, bold 12-month aged white cheddar with deep savory sharpness.',
        price: 70,
        stockQuantity: 35,
        threshold: 20,
        badge: 'Aged',
      },
      {
        name: 'Creamy Whipped Ricotta',
        category: 'cheese',
        description: 'Light, silky clouds of fresh Italian ricotta dolloped over the pizza.',
        price: 80,
        stockQuantity: 24,
        threshold: 15,
        badge: 'Gourmet',
      },
      {
        name: 'Plant-Based Vegan Mozzarella',
        category: 'cheese',
        description: '100% dairy-free artisanal cashew & coconut melt with authentic stringiness.',
        price: 75,
        stockQuantity: 30,
        threshold: 15,
        badge: '100% Vegan 🌱',
      },
      {
        name: 'Smoked Provolone & Gouda Blend',
        category: 'cheese',
        description: 'Distinctive wood-smoked Dutch gouda blended with golden provolone.',
        price: 85,
        stockQuantity: 14, // Low stock demo
        threshold: 20,
        badge: 'Smoked',
      },
    ];

    // 4. VEGETABLES
    const veggiesData = [
      {
        name: 'Bell Peppers (Tricolor)',
        category: 'veggie',
        description: 'Sweet, crisp red, yellow, and green bell pepper strips.',
        price: 35,
        stockQuantity: 45,
        threshold: 20,
      },
      {
        name: 'Kalamata & Black Olives',
        category: 'veggie',
        description: 'Brined Mediterranean olives sliced for rich, salty bursts.',
        price: 45,
        stockQuantity: 38,
        threshold: 20,
      },
      {
        name: 'Caramelized Red Onions',
        category: 'veggie',
        description: 'Slow-braised sweet onions caramelized to amber perfection.',
        price: 25,
        stockQuantity: 55,
        threshold: 20,
      },
      {
        name: 'Pickled Jalapeños',
        category: 'veggie',
        description: 'Crisp jalapeño rings with tangy brine and moderate heat.',
        price: 35,
        stockQuantity: 32,
        threshold: 20,
      },
      {
        name: 'Sliced Button Mushrooms',
        category: 'veggie',
        description: 'Fresh earthy white button mushrooms, pan-seared in olive oil.',
        price: 40,
        stockQuantity: 15, // Low stock demo
        threshold: 20,
      },
      {
        name: 'Sun-Dried & Cherry Tomatoes',
        category: 'veggie',
        description: 'Sweet burst cherry tomatoes complemented by intensely flavored sun-dried tomatoes.',
        price: 40,
        stockQuantity: 30,
        threshold: 20,
      },
      {
        name: 'Sweet Golden Corn',
        category: 'veggie',
        description: 'Juicy American sweet corn kernels.',
        price: 30,
        stockQuantity: 42,
        threshold: 20,
      },
      {
        name: 'Fresh Baby Spinach',
        category: 'veggie',
        description: 'Tender baby spinach leaves wilted lightly in the oven.',
        price: 35,
        stockQuantity: 28,
        threshold: 15,
      },
    ];

    const insertedBases = await InventoryItem.insertMany(basesData);
    const insertedSauces = await InventoryItem.insertMany(saucesData);
    const insertedCheeses = await InventoryItem.insertMany(cheesesData);
    const insertedVeggies = await InventoryItem.insertMany(veggiesData);

    console.log(`  - Seeded ${insertedBases.length} Bases`);
    console.log(`  - Seeded ${insertedSauces.length} Sauces`);
    console.log(`  - Seeded ${insertedCheeses.length} Cheeses`);
    console.log(`  - Seeded ${insertedVeggies.length} Veggies`);

    console.log('🍕 Seeding Chef-Crafted Pizza Varieties...');

    const varietiesData = [
      {
        name: 'Margherita Bella Classico',
        tagline: 'The timeless Neapolitan queen with bubbling mozzarella and fresh basil',
        description: 'Handcrafted with authentic San Marzano tomato sauce, fresh Fior di Latte mozzarella, fragrant basil leaves, and cold-pressed extra virgin olive oil.',
        basePrice: 320,
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
        isVegetarian: true,
        defaultBase: insertedBases[0]._id,
        defaultSauce: insertedSauces[0]._id,
        defaultCheese: insertedCheeses[0]._id,
        defaultVeggies: [insertedVeggies[5]._id], // Cherry tomatoes
      },
      {
        name: 'Farmhouse Garden Extravaganza',
        tagline: 'Loaded with oven-roasted vegetables on a bed of rich tomato and cheese',
        description: 'Crunchy bell peppers, caramelized onions, sweet golden corn, and earth-rich mushrooms baked over gooey mozzarella on our signature thin crust.',
        basePrice: 420,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
        isVegetarian: true,
        defaultBase: insertedBases[0]._id,
        defaultSauce: insertedSauces[0]._id,
        defaultCheese: insertedCheeses[0]._id,
        defaultVeggies: [insertedVeggies[0]._id, insertedVeggies[2]._id, insertedVeggies[4]._id, insertedVeggies[6]._id],
      },
      {
        name: 'Fiery Peri Peri Cottage Supreme',
        tagline: 'Bold African bird’s eye chili heat paired with sharp cheddar and peppers',
        description: 'Zesty peri peri sauce base topped with aged cheddar, fiery pickled jalapeños, spiced cottage cheese cubes, and crispy red peppers.',
        basePrice: 460,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
        isVegetarian: true,
        defaultBase: insertedBases[1]._id,
        defaultSauce: insertedSauces[2]._id,
        defaultCheese: insertedCheeses[1]._id,
        defaultVeggies: [insertedVeggies[0]._id, insertedVeggies[3]._id],
      },
      {
        name: 'Truffle & Forest Wild Mushroom',
        tagline: 'Silky garlic alfredo, wood-smoked provolone, and sautéed mushrooms',
        description: 'Whole wheat sourdough crust slathered in velvety garlic alfredo, crowned with smoked gouda blend, sliced button mushrooms, and tender baby spinach.',
        basePrice: 520,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
        isVegetarian: true,
        defaultBase: insertedBases[4]._id,
        defaultSauce: insertedSauces[1]._id,
        defaultCheese: insertedCheeses[4]._id,
        defaultVeggies: [insertedVeggies[4]._id, insertedVeggies[7]._id],
      },
      {
        name: 'Pesto Mediterranean Delight',
        tagline: 'Genovese basil pesto with whipped ricotta, olives & sun-dried tomatoes',
        description: 'Vibrant basil pesto sauce, clouds of creamy whipped ricotta, salty Kalamata olives, and sweet sun-dried tomatoes over hand-tossed crust.',
        basePrice: 480,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80',
        isVegetarian: true,
        defaultBase: insertedBases[0]._id,
        defaultSauce: insertedSauces[3]._id,
        defaultCheese: insertedCheeses[2]._id,
        defaultVeggies: [insertedVeggies[1]._id, insertedVeggies[5]._id],
      },
      {
        name: 'Double Cheese Burst Volcano',
        tagline: 'Stuffed crust rim overflowing with molten cheese and savory toppings',
        description: 'For genuine cheese devotees: cheese-infused rim, double mozzarella layer, grilled onions, bell peppers, and sweet corn.',
        basePrice: 540,
        image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800&auto=format&fit=crop&q=80',
        isVegetarian: true,
        defaultBase: insertedBases[2]._id,
        defaultSauce: insertedSauces[0]._id,
        defaultCheese: insertedCheeses[0]._id,
        defaultVeggies: [insertedVeggies[0]._id, insertedVeggies[2]._id, insertedVeggies[6]._id],
      },
    ];

    await PizzaVariety.insertMany(varietiesData);
    console.log(`  - Seeded ${varietiesData.length} Predefined Pizza Varieties`);

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

