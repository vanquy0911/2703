const nodemailer = require("nodemailer");

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "820dac64f2fe28",
        pass: "8c32b9d494ad74",
    },
});
//http://localhost:3000/api/v1/auth/resetpassword/a87edf6812f235e997c7b751422e6b2f5cd95aa994c55ebeeb931ca67214d645

// Send an email using async/await;
module.exports = {
    sendMail: async function (to, url) {
        const info = await transporter.sendMail({
            from: 'admin@hehehe.com',
            to: to,
            subject: "reset pass",
            text: "click vo day de doi pass", // Plain-text version of the message
            html: "click vo <a href=" + url + ">day</a> de doi pass", // HTML version of the message
        });
    },
    sendNewUserPassword: async function (to, username, password) {
        try {
            const info = await transporter.sendMail({
                from: 'admin@hehehe.com',
                to: to,
                subject: "Chào mừng - Mật khẩu của bạn",
                text: `Chào ${username}, mật khẩu của bạn là: ${password}`,
                html: `<h3>Chào ${username},</h3><p>Mật khẩu đăng nhập của bạn là: <b>${password}</b></p><p>Vui lòng đổi mật khẩu sau khi đăng nhập.</p>`,
            });
            console.log(`Đã gửi mail cho: ${to}`);
        } catch (error) {
            console.error(`Lỗi gửi mail cho ${to}:`, error.message);
        }
    }
}