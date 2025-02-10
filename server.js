const express = require('express');
const cors = require('cors');
//const { scanWebPage } = require('./index.js');
const GeminiAPI = require('./geminiApi');

// Create an instance
const gemini = new GeminiAPI(process.env.GEMINI_API_KEY);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    try {
        const { url, prompt } = req.body;
        const result = await scanWebPage(url, prompt);
        res.json({ success: true, result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add HTML source submission endpoint
app.post('/submit-source', async (req, res) => {
    try {
        const { prompt, html } = req.body;
        if (!prompt || !html) {
            return res.status(400).json({ error: 'Both prompt and HTML source are required' });
        }

        // Here you can process both the prompt and HTML source as needed
        console.log('Received prompt:', prompt);
        //console.log('Received HTML source:', html.substring(0, 100) + '...');

        // Process the input and generate code (replace this with your actual code generation logic)
        const generatedCode = await generatePlaywrightCode(prompt, html);

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

// Helper function to generate Playwright code (replace with your actual implementation)
async function generatePlaywrightCode(prompt, html) {
   // const gemini = new GeminiAPI();
const playwrightScript = await gemini.analyzeHtml(html, prompt);
console.log('\nPlaywright Script Generated');
return playwrightScript;
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
