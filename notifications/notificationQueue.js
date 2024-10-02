const { fetchData, insertData } = require('../services/database');
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
    const pendingNotifications = await fetchData('sent', `status = 'pend'`);
    for (const notification of pendingNotifications) {
      const notificationDate = moment(notification.timestamp).format('YYYY-MM-DD');

      const recentNotifications = await fetchData('sent', `studentID = ${notification.studentID}`);
      const sameDayNotifications = recentNotifications.filter(n => {
        const recentDate = moment(n.timestamp).format('YYYY-MM-DD');
        return recentDate === notificationDate;
      });

      const recentScan = await fetchData('scans', `studentID = ${notification.studentID}`);

      const successCount = sameDayNotifications.filter(n => n.status === 'sent').length;


      const studentData = await fetchData('students', `id = ${notification.studentID}`);
      if (studentData.length === 0) continue;

      const student = studentData[0];
      const { timestamp } = notification;

      // Check if the last notification for the user is 'sent'
      const lastNotification = recentNotifications[recentNotifications.length - 1];


      const lastScan = recentScan[recentScan.length - 1];

      if(lastScan.status === 'out') { lastScan.status = 'exitted' }
      if(lastScan.status === 'in') { lastScan.status = 'entered' }

      const notificationSent = await sendNotificationWithInterval(student, student.lrn, timestamp, lastScan.status);

      const newSentData = {
        studentID: student.id,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        status: notificationSent ? 'sent' : 'fail',
      };

      await insertData('sent', newSentData);
      console.log(`Notification sent and new entry added for student ID ${student.id}`);
    }
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
};

const startNotificationProcessor = () => {
  setInterval(processPendingNotifications, 3000); // Check for pending notifications every 5 seconds
};

startNotificationProcessor();