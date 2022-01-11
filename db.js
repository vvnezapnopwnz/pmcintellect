// const pg = require('pg');
const pgp = require('pg-promise')(/* options */);

// const { Client } = require('pg');

// const client = new Client({
//     user: 'jsasjjko',
//     host: 'abul.db.elephantsql.com',
//     database: 'jsasjjko',
//     password: 'fEMWij6GR_o-APTBeUKdBks-GYgMXl2t',
//     port: 5432,
// });


const databaseConfig= {
  "host": "localhost",
  "port": 5432,
  "database": "postgres",
  "user": "postgres",
  "password": "astana2020"
};


// const db = pgp(
//   databaseConfig);

  const db = pgp(
    'postgres://jsasjjko:fEMWij6GR_o-APTBeUKdBks-GYgMXl2t@abul.db.elephantsql.com/jsasjjko',
  );
  

module.exports = db;
