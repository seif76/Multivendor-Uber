const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables


console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'empty');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);


let sequelizeInstance;

const initializeDatabase = async () => {
  if (sequelizeInstance) {
    console.log('Database is already connected.');
    return sequelizeInstance;
  }

  try {
    console.log('Connecting to the database...');
    sequelizeInstance = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false, // Disable logging for cleaner output
      }
    );

    // Test the connection
    await sequelizeInstance.authenticate();
    console.log('Database connection established successfully.');
    return sequelizeInstance;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error; // Re-throw the error for handling in the calling function
  }
};

module.exports = initializeDatabase;
