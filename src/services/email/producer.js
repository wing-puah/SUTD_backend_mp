const amqplib = require('amqplib');

const queue = 'invites';

async function queueUserInvites(userTodo) {
  const client = await amqplib.connect(process.env.CLOUDAMQP_URL);
  const channel = await client.createChannel();

  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(userTodo)), {
    contentType: 'application/json',
  });
}

module.exports = { queueUserInvites };
