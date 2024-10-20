import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { messageGenerator } from "./utils.js";

import Assistant from "./assistants/index.js";
import Threads from "./assistants/threads.js";

//Prompts
import buildPersonPrompt from "./prompts/build-person.js";
import assistantPrompt from "./prompts/assistant.js";

//Schemas
import buildPersonSchema from "./schemas/build-person.js";

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

    async startChat(name, person) {
        const characterAsString = JSON.stringify(person);

        return this.assistant.createAssistant(
            MODEL, {
            name,
            instructions: ` ${OpenAIGPT.PROMPTS.ASSISTANT} ${characterAsString}`,
        });
    }
}

export default OpenAIGPT;
