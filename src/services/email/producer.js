const amqplib = require('amqplib');

const queue = 'invites';

async function queueUserInvites(userTodo) {
  const client = await amqplib.connect(process.env.RABBITMQ_URL);
  const channel = await client.createChannel();
  console.log({ userTodo });
  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(userTodo)), {
    contentType: 'application/json',
  });
}

module.exports = { queueUserInvites };
