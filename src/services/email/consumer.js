require('dotenv').config();
const amqplib = require('amqplib');
const nodemailer = require('nodemailer');
const db = require('../../db');

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
    const client = await amqplib.connect(process.env.CLOUDAMQP_URL);
    const channel = await client.createChannel();
    await channel.assertQueue(queue);

    channel.consume(queue, async (msg) => {
      const { uid, tid, role } = JSON.parse(msg.content);
      const user = await db.findUserByUid(uid);

      if (!user) {
        channel.ack(msg);
        return;
      }

      const updateUserMap = await db.givePermissionToUser({ uid, tid, role });
      if (!updateUserMap) {
        throw new Error(`Issue with updating user`);
      }

      const mailOptions = createEmail(uid);

      transporter.sendMail(mailOptions, function (error, info) {
        _handleMailer(error, channel, msg, mailOptions);
      });
    });
  } catch (error) {
    channel.nack(msg);
    console.error('Issuse with rabbitmq', error);
  }
})();

function _handleMailer(error, channel, msg, mailOptions) {
  if (error) {
    console.error(`Error encountered: ${error}`);
    channel.nack(msg);
  } else {
    console.log(`Email sent: ${JSON.stringify(mailOptions)}`);
    channel.ack(msg);
  }
}
