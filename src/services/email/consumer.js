require('dotenv').config();
const amqplib = require('amqplib');
const nodemailer = require('nodemailer');

const queue = 'invites';

/**
 * by pass self-signed cert issue
 * https://github.com/nodemailer/nodemailer/issues/406#issuecomment-83941225
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PW,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function createEmail(email) {
  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Access to list',
    text: 'You are given access to edit list',
  };
}

(async () => {
  try {
    const client = await amqplib.connect(process.env.RABBITMQ_URL);
    const channel = await client.createChannel();
    await channel.assertQueue(queue);
    channel.consume(queue, (msg) => {
      const data = JSON.parse(msg.content);
      const mailOptions = createEmail(data.email);

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error(`Error encountered: ${error}`);
          channel.nack(msg);
        } else {
          console.log(`Email sent: ${JSON.stringify(mailOptions)}`);
          channel.ack(msg);
        }
      });
    });
  } catch (error) {
    console.error('Issuse with rabbitmq', error);
  }
})();
