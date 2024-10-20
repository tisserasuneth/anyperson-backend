import MODELS from '../ai/models/index.js';
import logger from '../logger/index.js';
import Character from '../../models/character.js';

const LLM = 'OpenAIGPT';
const TYPE = 'BUILD_PERSON';

async function buildPerson(data) {
    let character;
    try {
        const MODEL_HANDLER = new MODELS();
        const MODEL_CLS = MODEL_HANDLER.getModel(LLM);
        const MODEL = new MODEL_CLS();

        const response = await MODEL.generateResponse(
            MODEL_CLS.PROMPTS[TYPE],
            data,
            TYPE,
        );

        const parsedResponse = JSON.parse(response);
        const { features, imageDescription, summary } = parsedResponse;

        character = await Character.findOne({ _id: data._id });
        
        if (!character) {
            throw new Error('Character not found');
        }

        character.set({
            ...features,
            imageDescription,
            summary,
            metaData: { state: Character.STATES.COMPLETED },
        });

        await character.save();

    } catch (error) {
        logger.error(`Error encountered while building character: ${error.message}`);
    
        if (character) {
            character.metaData.state = Character.STATES.FAILED;
            character.metaData.errors.push(error.message);
            await character.save();
        }
    }
};

export default buildPerson;