/** DEPRECATED */

const { insertData } = require('../services/database');

const sendFacebookNotification = async (student, lrn, timestamp) => {
  // Facebook API integration logic

  // Assuming success
  const successStatusData = {
    studentID: student.id,
    status: '1',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  };
  await insertData('sent', successStatusData);
};

module.exports = {
  sendFacebookNotification,
};
