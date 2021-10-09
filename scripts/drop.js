require('dotenv').config();
const db = require('../src/db');

db.drop()
  .then(() => {
    console.log('Database drop completed');
    process.exit();
  })
  .catch((err) => {
    console.log(err);
    console.log('Database drop failed');
    process.exit(1);
  });
