const { fetchData, updateData } = require('../services/database');
const { sendEmailNotification } = require('../api/email');
const moment = require('moment');

const sendNotificationWithInterval = async (student, lrn, timestamp, type) => {
  try {
    await sendEmailNotification(student, lrn, timestamp, type);
    return true; 
  } catch (error) {
    console.error(`Failed to send notification for student ID ${student.id}:`, error);
    return false; 
  }
};

const processPendingNotifications = async () => {
  console.log('Processing pending notifications...');
  try {
    // Fetch only notifications with 'pend' status
    const pendingNotifications = await fetchData('sent', `status = 'pend'`);
    for (const notification of pendingNotifications) {
      const notificationDate = moment(notification.timestamp).format('YYYY-MM-DD');

      const recentScan = await fetchData('scans', `studentID = ${notification.studentID}`);
      if (recentScan.length === 0) continue;

      const studentData = await fetchData('students', `id = ${notification.studentID}`);
      if (studentData.length === 0) continue;

      const student = studentData[0];
      const { timestamp } = notification;

      // Get the status of the last scan
      const lastScan = recentScan[recentScan.length - 1];
      if (lastScan.status === 'out') {
        lastScan.status = 'exitted';
      }
      if (lastScan.status === 'in') {
        lastScan.status = 'entered';
      }

      const notificationSent = await sendNotificationWithInterval(student, student.lrn, timestamp, lastScan.status);

      const updatedData = {
        status: notificationSent ? 'sent' : 'fail', 
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
      };

      await updateData('sent', notification.id, updatedData); 
      console.log(`Notification updated for student ID ${student.id}`);
    }
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
};

const startNotificationProcessor = () => {
  setInterval(processPendingNotifications, 3000); 
};

startNotificationProcessor();
