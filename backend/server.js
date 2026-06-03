require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Test database connection and start server
db.raw('SELECT 1')
  .then(async () => {
    console.log('✅ PostgreSQL connected successfully');

    // Auto-migrate and seed
    try {
      console.log('Running database migrations...');
      await db.migrate.latest();
      console.log('Running database seeds...');
      await db.seed.run();
      console.log('Migrations and seeds completed successfully.');
    } catch (err) {
      console.error('Error during auto-migration/seeding:', err.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 GymNTonic API running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API Base: http://localhost:${PORT}/api/v1`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.log('💡 Make sure PostgreSQL is running and DB credentials are correct in .env');
    process.exit(1);
  });
