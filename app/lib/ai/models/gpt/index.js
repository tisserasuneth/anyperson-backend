import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import Assistant from "./assistants/index.js";
import Threads from "./assistants/threads.js";

import buildPersonPrompt from "./prompts/build-person.js";
import assistantPrompt from "./prompts/assistant.js";

import buildPersonSchema from "./schemas/build-person.js";

import logger from "../../../logger/index.js";
import { messageGenerator } from "./utils.js";

const MODEL = "gpt-4o-mini";

class OpenAIGPT {
    constructor() {
        this.model = new OpenAI();
        this.assistant = new Assistant();
        this.threads = new Threads();
    }

    static PROMPTS = {
        BUILD_PERSON: buildPersonPrompt,
        ASSISTANT: assistantPrompt,
    };

    static SCHEMAS = {
        BUILD_PERSON: buildPersonSchema,
    };

    async generateResponse(systemPrompt, userPrompt, schema) {
        const messages = messageGenerator(systemPrompt, userPrompt);

        const response = await this.model.chat.completions.create({
            model: MODEL,
            messages,
            response_format: zodResponseFormat(OpenAIGPT.SCHEMAS[schema], "build_person"),
        });

        if (!response.choices || !response.choices[0]) {
            throw new Error("Unexpected response from OpenAI");
        }

        return response.choices[0].message.content;
    }

    async startChat(person) {
        const { name } = person;
        const characterAsString = JSON.stringify(person);

        return this.assistant.createAssistant(
            MODEL, {
            name,
            instructions: ` ${OpenAIGPT.PROMPTS.ASSISTANT} ${characterAsString}`,
        }).catch((err) => {
            const ERROR = `Error encountered while creating assistant`;
            logger.error(`${ERROR} ${name}: ${err}`);
            throw new Error(`${ERROR} ${name}: ${err.message}`);
        });
    }

    async deleteChat(person) {
        const { assistant } = person;

        if (!assistant) {
            throw new Error("Assistant not found");
        }

        return this.assistant.deleteAssistant(assistant)
            .catch((err) => {
                const ERROR = `Error encountered while deleting assistant`;
                logger.error(`${ERROR} ${assistant}: ${err}`);
                throw new Error(`${ERROR} ${assistant}: ${err.message}`);
            });
    }
}

export default OpenAIGPT;
