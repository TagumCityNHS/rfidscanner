const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'TCNHS-Spta-2024',
  database: 'school',
  timezone: 'Asia/Manila',
  dateStrings: true
};

app.post('/check', async (req, res) => {
  console.log('Request received:', req.body);

  const { lrn, secureKey } = req.body;

  if (!lrn || !secureKey) {
    console.log('Response status: 400 - Missing lrn or secureKey');
    return res.status(400).send('Missing lrn or secureKey');
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Check if LRN exists
    const [students] = await connection.execute('SELECT * FROM students WHERE lrn = ?', [lrn]);
    if (students.length === 0) {
      console.log('Response status: 404 - LRN not found');
      return res.status(404).send('LRN not found');
    }

    const student = students[0];
    const dbBirthday = new Date(student.birthday); // Convert to Date object
    console.log(student);
    const inputBirthday = secureKey; // Format: MMDDYYYY

    const formattedDbBirthday = dbBirthday.toISOString().split('T')[0];
    const formattedDbBirthdayMMDDYYYY = `${formattedDbBirthday.slice(5, 7)}${formattedDbBirthday.slice(8, 10)}${formattedDbBirthday.slice(0, 4)}`;
    console.log(formattedDbBirthdayMMDDYYYY);
    // Validate secureKey
    if (formattedDbBirthdayMMDDYYYY !== inputBirthday) {
      console.log('Response status: 400 - Invalid secureKey');
      return res.status(400).send('Invalid secureKey');
    }

    // Fetch most recent scan
    const [scans] = await connection.execute(
      'SELECT * FROM scans WHERE studentID = ? ORDER BY timestamp DESC LIMIT 1',
      [student.id]
    );

    if (scans.length === 0) {
      console.log('Response status: 404 - No scans found for this student');
      return res.status(404).send('No scans found for this student');
    }

    const recentScan = scans[0];
    const response = {
      status: recentScan.status,
      fname: student.fname,
      lname: student.lname,
      timestamp: recentScan.timestamp
    };
    console.log('Response status: 200', response);
    res.status(200).json(response);

    await connection.end();
  } catch (error) {
    console.error(error);
    console.log('Response status: 500 - Internal Server Error');
    res.status(500).send('Internal Server Error');
  }
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});