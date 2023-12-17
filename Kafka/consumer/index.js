const { Kafka } = require('kafkajs');
const { Pool } = require('pg');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka-broker-1:9092']
});

const consumer = kafka.consumer({ groupId: 'my-group' });

const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = JSON.parse(message.value.toString());
      await pool.query('INSERT INTO my_table(name, surname) VALUES($1, $2)', [payload.name, payload.surname]);
    },
  });
})();