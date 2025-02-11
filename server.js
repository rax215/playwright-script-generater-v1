const express = require('express');
const cors = require('cors');
const GeminiAPI = require('./geminiApi');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Add HTML source submission endpoint
app.post('/submit-source', async (req, res) => {
    try {
        const { prompt, html, includeHtml, model, apiKey } = req.body;
       // console.log('Received request:', { prompt, includeHtml, model });
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        if (includeHtml && !html) {
            return res.status(400).json({ error: 'HTML source is required when includeHtml is true' });
        }

        // Create a new instance with the provided API key and model
        const gemini = new GeminiAPI(apiKey, model);

        // Here you can process both the prompt and HTML source as needed
        console.log('Received prompt:', prompt);
        if (includeHtml) {
            console.log('Received HTML source');
        } else {
            console.log('HTML source not included');
        }

        // Process the input and generate code
        const generatedCode = await generatePlaywrightCode(gemini, prompt, includeHtml, html);

        res.json({ 
            success: true, 
            message: 'Code generated successfully',
            generatedCode: generatedCode
        });
    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to generate Playwright code
async function generatePlaywrightCode(gemini, prompt, includeHtml, html) {
    if(includeHtml){
        const playwrightScript = await gemini.analyzeHtml(html, prompt);
        console.log('\nPlaywright Script Generated');
        return playwrightScript;
    }else{
        const response = await gemini.generateSummary(prompt);
        console.log('\nModel response');
        return response;
    }
    
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
