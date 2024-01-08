const express = require('express');
const { Kafka } = require('kafkajs');
const app = express();
app.use(express.json());

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka-broker-1:29092']
});

let producer = kafka.producer();

producer.connect().then(() => {
  console.log('Connected to Kafka');
}).catch(error => {
  console.error('Could not connect to Kafka', error);
});

app.post('/event', async (req, res) => {
  try {
    await producer.send({
      topic: 'my-topic',
      messages: [
        { value: JSON.stringify(req.body) },
      ],
    });
    console.info(`Message sent to Kafka: ${JSON.stringify(req.body)}`);
    res.send({ status: 'ok' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'error', message: 'Could not send message to Kafka' });
  }
});

app.listen(4000, () => {
  console.log('Producer is listening on port 4000');
});