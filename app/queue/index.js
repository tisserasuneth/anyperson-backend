import amqp from 'amqplib';
import logger from '../lib/logger/index.js';
import JOBS from '../lib/jobs/index.js';
import { v4 as uuidv4 } from 'uuid';

const QUEUE_NAME = process.env.BASE_QUEUE_NAME || 'JOBS';

let connection;
let channel;

const connectQueue = async () => {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    return channel.assertQueue(QUEUE_NAME, { durable: true });
}

const sendToQueue = async (job) => {
    await channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(job)), { persistent: true });
}

const createJob = (type, data, options = {}) => {

    if (!type || !data) {
        logger.error('Verify inputs for creating a job');
        return;
    }

    return {
        id: uuidv4(),
        type,
        data,
        ...options,
    };
}

const startConsumer = async () => {
    
    if (!channel) {
        logger.error('Channel is not initialized, please call connectQueue first');
        return;
    }

    channel.consume(QUEUE_NAME, (message) => {
        const job = JSON.parse(message.content.toString());
        logger.info(`Received job with id ${job.id}`);

        const jobHandler = JOBS[job.type];

        if (!jobHandler) {
            logger.error(`No handler for job type ${job.type}`);
            channel.ack(message);
            return;
        }

        jobHandler(job.data).then(() => {
            logger.info(`Job with id ${job.id} completed`);
            channel.ack(message);
        }).catch((err) => {
            logger.error(`Job with id ${job.id} failed: ${err.message}`);
            channel.nack(message);
        });
    });
}

export default {
    connectQueue,
    sendToQueue,
    startConsumer,
    createJob,
}