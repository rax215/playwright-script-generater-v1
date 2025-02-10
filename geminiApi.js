const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAPI {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async analyzeHtml(htmlContent, text) {
        try {
            const prompt = text +' ' + htmlContent;
            const result = await this.model.generateContent(prompt);
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
            const prompt = `Summarize the following content: ${text}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let script = response.text()
            return script.substring(
                script.indexOf("```") + 3, 
                script.lastIndexOf("```")
            );
        } catch (error) {
            console.error('Error generating summary:', error);
            throw error;
        }
    }
}

module.exports = GeminiAPI;
