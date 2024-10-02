const mysql = require('mysql2'); 

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'TCNHS-Spta-2024',
  database: 'school',
});

connection.connect(err => {
  if (err) {
    console.error(`[MYSQL] error (${err.code}): ${err.stack}`); // Format error message
  }
});

// Function to fetch data from a specified table with a given condition
const fetchData = (tableName, condition) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM ${tableName} WHERE ${condition}`, (error, results) => {
      if (error) return reject(`[MYSQL] error (${error.code}): ${error.message}`); // Format error message
      resolve(results);
    });
  });
};

// Function to insert data into a specified table
const insertData = (tableName, data) => {
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO ${tableName} SET ?`, data, (error, results) => {
      if (error) return reject(`[MYSQL] error (${error.code}): ${error.message}`); // Format error message
      resolve(results);
    });
  });
};

module.exports = {
  fetchData,
  insertData, 
};