const { sequelize } = require('./config/database');
const User = require('./models/User');
const Food = require('./models/Food');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');
    
    // Authenticate connection
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ All tables synced successfully');
    
    console.log('\n📊 Database is ready!');
    console.log('Tables created:');
    console.log('  - Users');
    console.log('  - Foods');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync error:', error.message);
    process.exit(1);
  }
}

syncDatabase();
