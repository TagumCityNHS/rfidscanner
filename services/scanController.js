const moment = require('moment');
const { fetchData, insertData } = require('./database');
const { failLogScan, logScan } = require('./logService');
const signale = require('signale');

const handleScan = async (hash, timestamp, scanner) => {
  try {
    // Fetch student data based on the provided hash (LRN)
    const students = await fetchData('students', `securedlrn = '${hash}'`);
    if (students.length === 0) {
      failLogScan('Student not found', hash);
      signale.warn(`[#${Number(scanner) + 1}] Student not found for hash: ${hash}`);
      return { message: 'Student not found', scanner: scanner };
    }

    const student = students[0]; // Get the first student from the result
    const today = moment(timestamp).format('YYYY-MM-DD'); // Format the provided timestamp to 'YYYY-MM-DD'

    const existingScans = await fetchData('scans', `studentID = ${student.id} AND DATE(timestamp) = '${today}'`);


    if (existingScans.length > 0) {
      const lastScan = existingScans[existingScans.length - 1]; // Get the last scan of the day
      const lastScanTime = moment(lastScan.timestamp); // Get the timestamp of the last scan
      const currentTime = moment(timestamp); // Get the current timestamp
      const difference = currentTime.diff(lastScanTime, 'minutes'); // Calculate the difference in minutes
      if (difference < 1) {
        return { message: 'Scan failed. Cooldown.' };
      }
    } 

    let status = 'in'; // Default status is 'in'
    if (existingScans.length > 0) {
      const lastScan = existingScans[existingScans.length - 1]; // Get the last scan of the day
      if (lastScan.status === 'in') {
        status = 'out'; // Change status to 'out' if the last scan status was 'in'
      }
    }

    const formattedTimestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss'); // Format the timestamp to 'YYYY-MM-DD HH:mm:ss'

    // Prepare scan data to be inserted
    const scanData = {
      timestamp: formattedTimestamp,
      studentID: student.id,
      status,
      scanner,
      lrn: student.lrn, 
    };

    let name = student.fname + ' ' + student.lname; 
    await insertData('scans', scanData); 
    logScan(name, student.lrn, status); 
    signale.success(`[#${Number(scanner) + 1}] Scan recorded: ${name} (${student.lrn}) with status ${status}`);

    // Prepare sent data to be inserted
    const sentData = {
      studentID: student.id,
      timestamp: formattedTimestamp,
      status: '3',
    };

    await insertData('sent', sentData); // Insert the sent data into the 'sent' table

    // Return a success message along with student details
    return {
      message: 'Scan recorded successfully',
      student: {
        fname: student.fname,
        lname: student.lname,
        lrn: student.lrn,
        grade: student.grade,
        section: student.section,
        scanner,
      }
    };
  } catch (error) {
    signale.error('Error:', error); // Log the error to the console
    failLogScan(error, hash); // Log the failure
    return { message: 'Scan failed. Internal Server Error' }; // Return a generic error message
  }
};

const handleQrScan = async (hash, timestamp, scanner) => {
  try {
    // Fetch student data based on the provided hash (LRN)
    const students = await fetchData('students', `lrn = '${hash}'`);
    if (students.length === 0) {
      failLogScan('Student not found', hash);
      signale.warn(`[#${Number(scanner) + 1}] Student not found for hash: ${hash}`);
      return { message: 'Student not found', scanner: scanner };
    }

    const student = students[0]; // Get the first student from the result
    const today = moment(timestamp).format('YYYY-MM-DD'); // Format the provided timestamp to 'YYYY-MM-DD'

    // Fetch existing scans for the student on the same day
    const existingScans = await fetchData('scans', `studentID = ${student.id} AND DATE(timestamp) = '${today}'`);

     

    if (existingScans.length > 0) {
      const lastScan = existingScans[existingScans.length - 1]; // Get the last scan of the day
      const lastScanTime = moment(lastScan.timestamp); // Get the timestamp of the last scan
      const currentTime = moment(timestamp); // Get the current timestamp
      const difference = currentTime.diff(lastScanTime, 'minutes'); // Calculate the difference in minutes
      if (difference < 1) {
        return { message: 'Scan failed. Cooldown.' };
      }
    } 

    let status = 'in'; // Default status is 'in'
    if (existingScans.length > 0) {
      const lastScan = existingScans[existingScans.length - 1]; // Get the last scan of the day
      if (lastScan.status === 'in') {
        status = 'out'; // Change status to 'out' if the last scan status was 'in'
      }
    }

    const formattedTimestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss'); // Format the timestamp to 'YYYY-MM-DD HH:mm:ss'

    // Prepare scan data to be inserted
    const scanData = {
      timestamp: formattedTimestamp,
      studentID: student.id,
      status,
      scanner,
      lrn: student.lrn, 
    };

    let name = student.fname + ' ' + student.lname; 
    await insertData('scans', scanData); 
    logScan(name, student.lrn, status); 
    signale.success(`[#${Number(scanner) + 1}] Scan recorded: ${name} (${student.lrn}) with status ${status}`);

    // Prepare sent data to be inserted
    const sentData = {
      studentID: student.id,
      timestamp: formattedTimestamp,
      status: '3',
    };

    await insertData('sent', sentData); // Insert the sent data into the 'sent' table

    // Return a success message along with student details
    return {
      message: 'Scan recorded successfully',
      student: {
        fname: student.fname,
        lname: student.lname,
        lrn: student.lrn,
        grade: student.grade,
        section: student.section,
        scanner,
      }
    };
  } catch (error) {
    signale.error('Error:', error); // Log the error to the console
    failLogScan(error, hash); // Log the failure
    return { message: 'Scan failed. Internal Server Error' }; // Return a generic error message
  }
};

module.exports = {
  handleScan, // Export the handleScan function
  handleQrScan
};