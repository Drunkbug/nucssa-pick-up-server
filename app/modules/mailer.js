const nodemailer = require('nodemailer');
const _ = require('lodash');

const EMAIL_USER = process.env['EMAIL_USER'];
const EMAIL_PASSWORD = process.env['EMAIL_PASSWORD'];

const {
  getDriverSubmissionHTML,
  getStudentSubmissionHTML,
  getDriverVerificationSuccessHTML,
  getDriverTakingOrderHTML,
  getStudentTakingOrderHTML,
} = require('../data/emailTempaltes');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});


function buildMailOptions({ to, subject, htmlText }) {
  return {
    from: '"NUCSSA IT部" <nucssait@gmail.com>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    // text: 'Hello world?', // plain text body
    html: htmlText, // html body
  };
}

function buildDriverOptions(driverSubmission) {
  let { huskyEmail } = driverSubmission;

  return buildMailOptions({
    to: huskyEmail,
    subject: 'NUCSSA接机活动: 司机报名成功',
    htmlText: getDriverSubmissionHTML(driverSubmission),
  })
}


function buildStudentOptions(studentSubmission, individualStudent) {
  let { email } = individualStudent;

  return buildMailOptions({
    to: email,
    subject: 'NUCSSA接机活动: 乘客报名成功',
    htmlText: getStudentSubmissionHTML(studentSubmission, individualStudent),
  })
}

function buildDriverVerificationOptions(driverSubmission) {
  let { huskyEmail, name } = driverSubmission;

  return buildMailOptions({
    to: huskyEmail,
    subject: 'NUCSSA接机活动: 司机认证成功',
    htmlText: getDriverVerificationSuccessHTML(name),
  })
}

function buildDriverTakingOrderOptions(driverSubmission, studentWechatId) {
  let { huskyEmail, name } = driverSubmission;

  return buildMailOptions({
    to: huskyEmail,
    subject: 'NUCSSA接机活动: 成功接单',
    htmlText: getDriverTakingOrderHTML(name, studentWechatId),
  })
}

function buildStudentTakingOrderOptions(studentWechatId, individualStudent) {
  let { email, name } = individualStudent;

  return buildMailOptions({
    to: email,
    subject: 'NUCSSA接机活动: 乘客报名成功',
    htmlText: getStudentTakingOrderHTML(name, studentWechatId),
  })
}

async function sendMail(mailOptions) {
  return transporter.sendMail(mailOptions);
}

async function sendDriverEmail(driverSubmission) {
  let driverOptions = buildDriverOptions(driverSubmission);
  return sendMail(driverOptions)
}

async function sendStudentEmail(studentSubmission) {
  let studentMailOptionSet = _.map(studentSubmission.studentSet, (s) => {
    return buildStudentOptions(studentSubmission, s);
  });

  let asyncFunctionSet = _.map(studentMailOptionSet, (studentMailOption) => {
    return sendMail(studentMailOption);
  });

  return Promise.all(asyncFunctionSet);
}

async function sendDriverVerificationEmail(driverSubmission) {
  let driverVerificationOptions = buildDriverVerificationOptions(driverSubmission);
  return sendMail(driverVerificationOptions);
}

async function sendDriverTakingOrderEmail(driverSubmission, studentWechatId) {
  let driverTakingOrderOptions = buildDriverTakingOrderOptions(driverSubmission, studentWechatId);
  return sendMail(driverTakingOrderOptions);
}

async function sendStudentTakingOrderEmail(studentSubmission) {
  let studentMailOptionSet = _.map(studentSubmission.studentSet, (s) => {
    return buildStudentTakingOrderOptions(studentSubmission.wechatId, s);
  });

  let asyncFunctionSet = _.map(studentMailOptionSet, (studentMailOption) => {
    return sendMail(studentMailOption);
  });

  return Promise.all(asyncFunctionSet);
}

module.exports = {
  sendDriverEmail,
  sendStudentEmail,
  sendDriverVerificationEmail,
  sendDriverTakingOrderEmail,
  sendStudentTakingOrderEmail,
};
