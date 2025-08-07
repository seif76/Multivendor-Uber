const bcrypt = require('bcrypt');
require('dotenv').config();
const initializeDatabase = require('../../../config/mysql/dbconnection'); // your DB connection file


module.exports = async function syncAdminTables() {
  try {
    const sequelize = await initializeDatabase();
    const Admin = require('../admin')(sequelize);

    // 1. Ensure the Admin table exists and is up to date
    await Admin.sync({ alter: true }); // This will create or alter the table as needed
    console.log('✅ Admin tables synced successfully.');
    // 2. Prepare default admin data
    const defaultPassword = await bcrypt.hash('123', 10);

    const admins = [
      {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: defaultPassword,
        role: 'super_admin',
        permissions: {
          customers: ['view', 'edit', 'delete', 'create'],
          captains: ['view', 'edit', 'delete', 'create'],
          vendors: ['view', 'edit', 'delete', 'create'],
          orders: ['view', 'edit', 'delete'],
          analytics: ['view', 'export'],
          support: ['view', 'respond', 'assign'],
          settings: ['view', 'edit'],
          admins: ['view', 'edit', 'delete', 'create']
        },
        is_active: true
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: defaultPassword,
        role: 'admin',
        permissions: {
          customers: ['view', 'edit'],
          captains: ['view', 'edit'],
          vendors: ['view', 'edit'],
          orders: ['view', 'edit'],
          analytics: ['view'],
          support: ['view', 'respond'],
          settings: ['view']
        },
        is_active: true
      },
      {
        username: 'moderator',
        email: 'moderator@example.com',
        password: defaultPassword,
        role: 'moderator',
        permissions: {
          customers: ['view'],
          captains: ['view'],
          vendors: ['view'],
          orders: ['view'],
          analytics: ['view'],
          support: ['view', 'respond'],
          settings: ['view']
        },
        is_active: true
      },
      {
        username: 'support',
        email: 'support@example.com',
        password: defaultPassword,
        role: 'support',
        permissions: {
          customers: ['view'],
          captains: ['view'],
          vendors: ['view'],
          orders: ['view'],
          analytics: ['view'],
          support: ['view', 'respond'],
          settings: ['view']
        },
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
    console.log('- Password: admin123');
  } catch (error) {
    console.error('Error seeding default admins:', error);
  }
};

