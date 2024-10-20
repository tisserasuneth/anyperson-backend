import QUEUE from '../queue/index.js';
import Character from '../models/character.js';
import MODELS from '../lib/ai/models/index.js';

import logger from '../lib/logger/index.js';

class Person {
    async create(req, res) {
        const { name, age, description } = req.body;

        if (!name || !age || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const character = await Character.create({ name, age, description })
            .catch((err) => {
                logger.error(`Error encountered while creating character: ${err}`);
            return res.status(500).json({ error: err.message });
        });

        const job = QUEUE.createJob('BUILD_PERSON', character);
        await QUEUE.sendToQueue(job);

        return res.status(202).json({ message: 'BUILD_PERSON job submitted', character: character._id });
    }

    async startChat(req, res) {
        const { id: characterId } = req.params;

        if (!characterId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const character = await Character.findOne({ _id: characterId })
            .catch((err) => {
                logger.error(`Error encountered while finding character: ${err}`);
                return res.status(500).json({ error: err.message });
            });

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const MODEL_CLS = MODELS.getModel(MODELS.MODEL_NAMES.OpenAIGPT);
        const MODEL = new MODEL_CLS();

        const assistant = await MODEL.startChat(character)
            .catch((err) => {
                logger.error(`Error encountered while starting chat for character ${character._id}: ${err}`);
                return res.status(500).json({ error: err.message });
            });

        character.assistant = assistant.id;

        await character.save()
            .catch((err) => {
                logger.error(`Error encountered while saving character ${character._id}: ${err}`);
                return res.status(500).json({ error: err.message });
            });

        return res.status(200).json({ message: 'Chat started', assistant: assistant.id });
    }

    async deleteChat(req, res) {
        const { id: characterId } = req.params;

        if (!characterId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const character = await Character.findOne({ _id: characterId })
            .catch((err) => {
                logger.error(`Error encountered while finding character: ${err}`);
                return res.status(500).json({ error: err.message });
            });

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const MODEL_CLS = MODELS.getModel(MODELS.MODEL_NAMES.OpenAIGPT);
        const MODEL = new MODEL_CLS();

        await MODEL.deleteChat(character)
            .catch((err) => {
                logger.error(`Error encountered while deleting chat for character ${character._id}: ${err}`);
                return res.status(500).json({ error: err.message });
            });

        character.assistant = null

        await character.save()
            .catch((err) => {
                logger.error(`Error encountered while saving character ${character._id}: ${err}`);
                return res.status(500).json({ error: err.message });
            });

        return res.status(200).json({ message: 'Chat deleted' });
    }
}

export default Person;
