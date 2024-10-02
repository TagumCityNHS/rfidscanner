const fs = require('fs');
const path = require('path');
const moment = require('moment');

const getEmailHtml = (name, lrn, timestamp, type) => {
  const emailTemplate = fs.readFileSync(path.join(__dirname, '.', 'email.html'), 'utf-8');
  const formattedTime = moment(timestamp).format('h:mmA');
  const formattedDate = moment(timestamp).format('MMMM D, YYYY');
  const htmlContent = emailTemplate
    .replace('RICKY M. RODRIGO JR', name)
    .replace('128770140628', lrn)
    .replace('7:30AM', formattedTime)
    .replace('entered', type)
    .replace('July 13, 2024', formattedDate)
  return htmlContent;
};

module.exports = {
  getEmailHtml,
};
