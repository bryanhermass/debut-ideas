const { Kafka } = require('kafkajs');
const { Pool } = require('pg');

// Configurar la conexión a Kafka
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

// Crear un consumidor de Kafka
let consumer = kafka.consumer({ groupId: 'my-group' });

// Conectar el consumidor a Kafka
consumer.connect().then(() => {
  console.log('Connected to Kafka');
}).catch(error => {
  console.error('Could not connect to Kafka', error);
});

// Configurar la conexión a la base de datos Postgres
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Crear una tabla en la base de datos
pool.query('CREATE TABLE IF NOT EXISTS events (name text, surname text)', (err, res) => {
  if (err) {
    console.error('Could not create table', err);
  } else {
    console.log('Table created');
  }
});

// Configurar el consumidor para que, cuando reciba un mensaje, lo inserte en la tabla de la base de datos
consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const data = JSON.parse(message.value.toString());
    const { name, surname } = data;
    pool.query('INSERT INTO events (name, surname) VALUES ($1, $2)', [name, surname], async (err, res) => {
      if (err) {
        console.error('Could not insert event', err);
      } else {
        console.log('Event inserted');
        await consumer.commitOffsets([{ topic, partition, offset: message.offset }]);
      }
    });
  },
});