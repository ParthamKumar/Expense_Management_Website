// db.js
import mysql from 'mysql';
import mysql2 from 'mysql2/promise';

// 🔁 Old-style connection (callback-based)
const con = mysql.createConnection({
  host: 'localhost',
  port: 5713,
  user: 'root',
  password: '',
  database: 'expense'
});

con.connect(err => {
  if (err) {
    console.error('MySQL connection error (con):', err);
  } else {
    console.log('MySQL connected (con)');
  }
});

// 🆕 New-style pool (promise-based, for transactions and async/await)
const pool = mysql2.createPool({
  host: 'localhost',
  port: 5713,
  user: 'root',
  password: '',
  database: 'expense',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export { con, pool };
