class OpenAIChatApi {
    constructor(apiKey, orgId = null) {
        this.apiKey = apiKey;
        this.orgId = orgId;
        this.headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
            "OpenAI-Beta": "assistants=v1"
        };
        if (this.orgId) {
            this.headers["OpenAI-Org"] = this.orgId;
        }
    }

    async createAssistant() {
        try {
            const response = await fetch("https://api.openai.com/v1/assistants", {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify({
                    "name": "Brow, the Browser Bro!",
                    "model": "gpt-3.5-turbo",
                    "instructions": "You are Brow, the Browser Bro, a web browser based chat assistant."
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating assistant:', error.message);
            throw error;
        }
    }

    async createThread() {
        try {
            const response = await fetch("https://api.openai.com/v1/threads", {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify({})
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating thread:', error.message);
            throw error;
        }
    }

    async sendMessageToThread(threadId, input) {
        try {
            if (!input.trim() || !threadId) return;
            const url = `https://api.openai.com/v1/threads/${threadId}/messages`;
            const response = await fetch(url, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify({ "role": "user", "content": input })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Message sent successfully!");
            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error.message);
            throw error;
        }
    }

    async getRunStatus(threadId, runId) {
        try {
            const url = `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.headers
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting run status:', error.message);
            throw error;
        }
    }
    async pollRunStatus(threadId, runId, delay = 500) {
        let status = null;
        while (status === null || status.status === "in_progress") {
            console.log("Run in progress");
            status = await this.getRunStatus(threadId, runId);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        console.log(`Run status: ${status.status}`);
        return status;
    }

    async createRunAndPollStatus(threadId, assistantId) {
        // https://api.openai.com/v1/threads/${threadId}/runs
        try {
            const url = `https://api.openai.com/v1/threads/${threadId}/runs`;
            const response = await fetch(url, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify({
                    "assistant_id": assistantId,
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Run created successfully!");
            const data = await response.json();
            return await this.pollRunStatus(threadId, data.id);
        } catch (error) {
            console.error('Error creating run and polling status:', error.message);
            throw error;
        }
    }

    async fetchMessages(threadId) {
        try {
            const url = `https://api.openai.com/v1/threads/${threadId}/messages`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.headers
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Messages fetched successfully!");
            return await response.json();
        } catch (error) {
            console.error('Error fetching messages:', error.message);
            throw error;
        }
    }

}

window.OpenAIChatApi = OpenAIChatApi;
