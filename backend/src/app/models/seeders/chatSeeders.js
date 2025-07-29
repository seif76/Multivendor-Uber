require('dotenv').config();
const initializeDatabase = require('../../../config/mysql/dbconnection'); // your DB connection file

module.exports = async function syncChatTables() {
  try {
    const sequelize = await initializeDatabase();

    // Import only new chat models
    const Chat = require('../chat')(sequelize);
    const ChatMessage = require('../chatMessage')(sequelize);


    const models = { Chat, ChatMessage };

    // Setup associations if needed
    Object.values(models).forEach((model) => {
      if (model.associate) model.associate(models);
    });

    // Sync only these new tables
    await sequelize.sync({ alter: true }); // NEVER use force here

    console.log('✅ Chat tables synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing chat tables:', error);
    process.exit(1);
  }
};
