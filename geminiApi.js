const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAPI {
    constructor(apiKey, model) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: model });
        this.chat = this.model.startChat({
            history: [{
              role: "user",
              parts: [{ text: "Hello" }],
            },
            {
              role: "model",
              parts: [{ text: "What can I help you with?" }],
            }],
          });
    }

    async analyzeHtml(htmlContent, text) {
        try {
            const prompt = text +' ' + htmlContent;
            const result = await this.chat.sendMessage(prompt);
            const response = await result.response;
            let script = response.text();
            //console.log('script:', script);
            script =  script.substring(
                script.indexOf("```") + 13
            );
            return script.substring(
                0, 
                script.indexOf("```")
            );
        } catch (error) {
            console.error('Error analyzing HTML:', error);
            throw error;
        }
    }

    async generateSummary(text) {
        try {
            const prompt = text;
            const result = await this.chat.sendMessage(prompt);
            const response = await result.response;
            return response.text()
        } catch (error) {
            console.error('Error generating summary:', error);
            throw error;
        }
    }
}

module.exports = GeminiAPI;
