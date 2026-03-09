const bcrypt = require('bcrypt');
require('dotenv').config();
const initializeDatabase = require('../../../config/mysql/dbconnection'); // your DB connection file

module.exports = async function syncAdminTables() {
  try {
    const sequelize = await initializeDatabase();
    const Admin = require('../admin')(sequelize);

    // 1. Ensure the Admin table exists and is up to date
    // This will drop the `permissions` column automatically if you are using { alter: true }
    await Admin.sync({ alter: true }); 
    console.log('✅ Admin tables synced successfully.');
    
    // 2. Prepare default admin data
    const defaultPassword = await bcrypt.hash('123', 10);

    const admins = [
      {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: defaultPassword,
        role: 'super_admin',
        is_active: true
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: defaultPassword,
        role: 'admin',
        is_active: true
      },
      {
        username: 'moderator',
        email: 'moderator@example.com',
        password: defaultPassword,
        role: 'moderator',
        is_active: true
      },
      {
        username: 'support',
        email: 'support@example.com',
        password: defaultPassword,
        role: 'support',
        is_active: true
      }
    ];

    // 3. Upsert (insert or update) each admin by username or email
    for (const admin of admins) {
      await Admin.upsert(admin, {
        where: { username: admin.username }
      });
    }

    console.log('Default admins seeded or updated successfully');
    console.log('Default credentials:');
    console.log('- Username: superadmin, admin, moderator, support');
    console.log('- Password: 123'); // Updated log to match actual hashed password
  } catch (error) {
    console.error('Error seeding default admins:', error);
  }
};