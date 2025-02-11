document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const submitSourceBtn = document.getElementById('submitSource');
    const promptInput = document.getElementById('promptInput');
    const closeBtn = document.querySelector('.close-btn');
    const clearBtn = document.getElementById('clearBtn');
    const loading = document.getElementById('loading');
    const responseContainer = document.getElementById('responseContainer');
    const responseCode = document.getElementById('responseCode');
    const copyBtn = document.getElementById('copyBtn');
    const includeHtmlCheckbox = document.getElementById('includeHtml');
        const modelSelect = document.getElementById('modelSelect');
    const apiKeyInput = document.getElementById('apiKey');

    // Try to load saved API key from storage
    chrome.storage.local.get(['apiKey'], function(result) {
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
    });

    // Save API key when it changes
    apiKeyInput.addEventListener('change', function() {
        chrome.storage.local.set({ apiKey: apiKeyInput.value });
    });

    // Function to clear the form
    function clearForm() {
        promptInput.value = '';
        responseContainer.style.display = 'none';
        responseCode.textContent = '';
        includeHtmlCheckbox.checked = true; // Reset checkbox to default checked state
        promptInput.focus();
    }

    // Function to get and submit HTML source of current tab
    async function getAndSubmitSource() {
        try {
            const prompt = promptInput.value.trim();
            const apiKey = apiKeyInput.value.trim();
            if (!prompt) {
                alert('Please enter a prompt message');
                return;
            }

            if (!apiKey) {
                alert('Please enter an API key');
                return;
            }

            // Show loading state
            submitSourceBtn.disabled = true;
            clearBtn.disabled = true;
            loading.style.display = 'block';
            responseContainer.style.display = 'none';

            // Get the HTML source only if checkbox is checked
            let sourceCode = '';
            if (includeHtmlCheckbox.checked) {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                const result = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => document.documentElement.outerHTML
                });
                sourceCode = result[0].result;
            }

            // Submit prompt and optionally HTML source
            const response = await fetch('http://localhost:3000/submit-source', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt: prompt,
                    html: sourceCode,
                    includeHtml: includeHtmlCheckbox.checked,
                    model: modelSelect.value,
                    apiKey: apiKey
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Hide loading and show response
            loading.style.display = 'none';
            responseCode.textContent = data.generatedCode;
            responseContainer.style.display = 'block';
            submitSourceBtn.disabled = false;
            clearBtn.disabled = false;

        } catch (error) {
            console.error('Error:', error);
            loading.style.display = 'none';
            responseContainer.style.display = 'none';
            submitSourceBtn.disabled = false;
            clearBtn.disabled = false;
            alert('Error: ' + error.message);
        }
    }

    // Function to copy code to clipboard
    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(responseCode.textContent);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy code to clipboard');
        }
    }

    // Add event listeners
    submitSourceBtn.addEventListener('click', getAndSubmitSource);
    clearBtn.addEventListener('click', clearForm);
    copyBtn.addEventListener('click', copyToClipboard);
    closeBtn.addEventListener('click', () => window.close());

    // Prevent popup from closing when clicking outside
    chrome.runtime.onConnect.addListener(function(port) {
        if (port.name === "popup") {
            port.onDisconnect.addListener(function() {
                // This will prevent the popup from closing
                chrome.runtime.connect({name: "popup"});
            });
        }
    });
    // Initial connection to prevent auto-close
    chrome.runtime.connect({name: "popup"});
});
