const fs = require('fs');
const moment = require('moment');

const ensureLogsDirectoryExists = () => {
  const logsDir = './logs/success';
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
};

const logScan = (studentName, lrn, status) => {
  ensureLogsDirectoryExists();
  const logFilePath = `logs/success/${moment().format('MM-DD-YYYY')}.txt`;
  const logMessage = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${studentName} with ${lrn} has logged ${status}\n`;
  fs.appendFileSync(logFilePath, logMessage);
};

const ensureFailLogsDirectoryExists = () => {
  const failLogsDir = './logs/fail';
  if (!fs.existsSync(failLogsDir)) {
    fs.mkdirSync(failLogsDir);
  }
};

const failLogScan = (error, lrn) => {
  ensureFailLogsDirectoryExists();
  const failLogFilePath = `logs/fail/${moment().format('MM-DD-YYYY')}.txt`;
  const failLogMessage = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] Error for ${lrn}: ${error}\n`;
  fs.appendFileSync(failLogFilePath, failLogMessage);
};

module.exports = {
  logScan,
  failLogScan,
};