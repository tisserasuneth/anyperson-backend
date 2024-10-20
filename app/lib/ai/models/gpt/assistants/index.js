import OpenAI from "openai";

class Assistant {
    constructor() {
        this.model = new OpenAI();
    }

    async createAssistant(model, data) {
        const { name, instructions } = data;
        const assistant = await this.model.beta.assistants.create({
            name,
            instructions: instructions,
            tools: [{ type: "code_interpreter" }],
            model,
        });

        return assistant;
    }

    async getAssistant(assistantId) {
        const assistant = await this.model.beta.assistants.retrieve(assistantId);

        if (!assistant) {
            throw new Error("Assistant not found");
        }

        return assistant;
    }

    async deleteAssitant(assistantId) {
        return this.model.beta.assistants.del(assistantId);
    }
}

export default Assistant;
