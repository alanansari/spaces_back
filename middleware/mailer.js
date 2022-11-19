const nodemailer = require('nodemailer');

const sendmail = async (email,otp) => {
    const msg = {
        from: "spaces.inc.si@gmail.com",
        to: email,
        subject: "OTP Verification from Spaces Inc.",
        text: "This is your 6-digit OTP for signing up active for 5 minutes : " + otp
    }

    const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: "spaces.inc.si@gmail.com",
                pass: "jnadkjkcgqsbdbzm"
            },
            port: 456,
            host: "smtp.gmail.com"
    });

    transporter.sendMail(msg,err=>{
        if(err) console.log(err);
        else{
             console.log("mail sent");
             return true;
        }
    });
}

module.exports = {sendmail};