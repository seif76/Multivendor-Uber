const initializeDatabase = require('../../../config/mysql/dbconnection'); // Adjust path as needed
const AdminVendorCategory = require('../adminVendorCategory'); // Adjust path as needed

module.exports = async function syncVendorCategories() {
  try {
    const sequelize = await initializeDatabase();
    const Category = AdminVendorCategory(sequelize); // Correctly initialize the model

    // 1. Ensure the AdminVendorCategory table exists and is up to date
    await Category.sync({ alter: true });
    console.log('✅ AdminVendorCategory table synced successfully.');

    // 2. Prepare default categories
    const defaultCategories = [
      {
        name: 'food',
        description: 'Food delivery from restaurants.',
        is_active: true,
      },
      {
        name: 'groceries',
        description: 'Grocery and supermarket items.',
        is_active: true,
      },
      {
        name: 'pharmacy',
        description: 'Medicines and health products.',
        is_active: true,
      },
      {
        name: 'stores',
        description: 'Clothing, shoes, and accessories.',
        is_active: true,
      }
    ];

    // 3. Upsert (insert or update) each category by name
    for (const category of defaultCategories) {
      await Category.upsert(category, {
        where: { name: category.name }
      });
    }

    console.log('✅ Default vendor categories seeded or updated successfully');

  } catch (error) {
    console.error('Error seeding default vendor categories:', error);
  }
};



// Run automatically if executed directly
if (require.main === module) {
    (async () => {
      await module.exports();
    })();
  }