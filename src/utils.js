const nodemailer = require('nodemailer');

const generateFourDigitCode = () => {
    const min = 1000;
    const max = 9999;
    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomCode;
}



  // Create a Nodemailer transporter using OAuth2
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "deybollar@gmail.com",
      pass:"ngya vngb klgd rwqm"
    }
  });

  


const sendVerificationEmail = async(toEmail, verificationCode,callback) => {
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: toEmail,
      subject: 'Email Verification Code',
      text: `Your verification code is: ${verificationCode}`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        callback(error)
      } else {
        console.log('Email sent: ' + info.response);
        callback(error)
      }
    });
  };





  //twillio verification


  module.exports = {sendVerificationEmail, generateFourDigitCode}