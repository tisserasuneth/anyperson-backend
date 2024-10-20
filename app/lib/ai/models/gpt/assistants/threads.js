import OpenAI from "openai";

class Threads {
    constructor(assistantId) {
        this.model = new OpenAI();
        this.assistantId = assistantId;
    }

    async createThread() {
        this.threadId = this.model.beta.threads.create();
    }

    async createMessage(message) {

        if (!this.threadId) {
            throw new Error("Thread not found");
        }

        return this.model.beta.messages.create(
            this.threadId,
            {
                role: "user",
                content: message,
            }
        );
    }

    async createRun() {

        if (!this.threadId) {
            throw new Error("Thread not found");
        }

        if (!this.assistantId) {
            throw new Error("Assistant not found, please create an assistant first");
        }

        return this.model.beta.runs.create(
            this.threadId,
            {
                assistant_id: this.assistantId,
                stream: true,
            }
        );
    }

    async getThread() {
        return this.model.beta.threads.retrieve(this.threadId);
    }

    async deleteThread() {
        return this.model.beta.threads.del(this.threadId);
    }


}

export default Threads;
