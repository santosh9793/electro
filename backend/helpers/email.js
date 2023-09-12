// Mail Setting
import nodemailer from "nodemailer";

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: 465,
	secure: true,
	auth: {
		// TODO: replace `user` and `pass` values from <https://forwardemail.net>
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD
	}
});

export function sendEmail(from, to, cc = '', bcc = '', subject, text) {
	// send mail with defined transport object
	// visit https://nodemailer.com/ for more options
	return transporter.sendMail({
		from: from,
		to: to,
		cc: cc,
		bcc: bcc,
		attachments: [{
			filename: 'text1.txt',
			content: 'hello world!'
		}],
		subject: subject,
		html: text
	});
}
