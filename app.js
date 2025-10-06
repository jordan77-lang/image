// Main application logic for the accessibility tool
document.addEventListener('DOMContentLoaded', function() {
    // Configuration - Update these with your actual API details
    const API_CONFIG = {
        endpoint: 'https://your-api-endpoint.com/api', // Replace with your actual API endpoint
        apiKey: null // Add your API key if required
    };

    const api = new AccessibilityAPI(API_CONFIG.endpoint, API_CONFIG.apiKey);
    
    // DOM elements
    const imageUpload = document.getElementById('image-upload');
    const contextInput = document.getElementById('context-input');
    const generateBtn = document.getElementById('generate-btn');
    const resultsContainer = document.getElementById('results-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorContainer = document.getElementById('error-container');

    // State
    let currentImage = null;

    // Event listeners
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerate);
    }

    // Handle image upload
    async function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Validate the image file
            ImageProcessor.validateImageFile(file);
            
            // Convert to base64
            currentImage = await ImageProcessor.fileToBase64(file);
            
            // Show preview
            showImagePreview(currentImage, file.name);
            
            // Enable generate button
            if (generateBtn) {
                generateBtn.disabled = false;
            }

            clearError();
        } catch (error) {
            showError(error.message);
            currentImage = null;
            if (generateBtn) {
                generateBtn.disabled = true;
            }
        }
    }

    // Handle generate button click
    async function handleGenerate() {
        if (!currentImage) {
            showError('Please upload an image first.');
            return;
        }

        const context = contextInput ? contextInput.value.trim() : '';
        
        try {
            showLoading(true);
            clearError();
            
            // Generate both alt text and long description
            const result = await api.generateBoth(currentImage, context);
            
            showResults(result);
        } catch (error) {
            showError(`Failed to generate descriptions: ${error.message}`);
        } finally {
            showLoading(false);
        }
    }

    // Show image preview
    function showImagePreview(imageSrc, fileName) {
        const previewContainer = document.getElementById('image-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="preview-card">
                    <img src="${imageSrc}" alt="Uploaded image preview" class="preview-image">
                    <p class="preview-filename">${fileName}</p>
                </div>
            `;
            previewContainer.style.display = 'block';
        }
    }

    // Show loading state
    function showLoading(isLoading) {
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
        if (generateBtn) {
            generateBtn.disabled = isLoading;
            generateBtn.textContent = isLoading ? 'Generating...' : 'Generate Descriptions';
        }
    }

    // Show results
    function showResults(result) {
        if (!resultsContainer) return;

        const altText = result.altText || result.alt_text || '';
        const longDescription = result.longDescription || result.long_description || '';

        resultsContainer.innerHTML = `
            <div class="results">
                <h3>Generated Accessibility Content</h3>
                
                <div class="result-section">
                    <h4>Alt Text</h4>
                    <div class="result-content">
                        <p class="result-text">${altText}</p>
                        <button class="copy-btn" onclick="copyToClipboard('${altText.replace(/'/g, "\\'")}')">
                            Copy Alt Text
                        </button>
                    </div>
                </div>

                <div class="result-section">
                    <h4>Long Description</h4>
                    <div class="result-content">
                        <p class="result-text">${longDescription}</p>
                        <button class="copy-btn" onclick="copyToClipboard('${longDescription.replace(/'/g, "\\'")}')">
                            Copy Long Description
                        </button>
                    </div>
                </div>

                <div class="result-actions">
                    <button class="btn btn-secondary" onclick="generateAgain()">Generate Again</button>
                    <button class="btn btn-primary" onclick="downloadResults()">Download Results</button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
    }

    // Show error message
    function showError(message) {
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <strong>Error:</strong> ${message}
                </div>
            `;
            errorContainer.style.display = 'block';
        }
    }

    // Clear error message
    function clearError() {
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }

    // Global functions for button clicks
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Show temporary success message
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    };

    window.generateAgain = function() {
        handleGenerate();
    };

    window.downloadResults = function() {
        const results = document.querySelector('.results');
        if (!results) return;

        const altText = results.querySelector('.result-section:first-of-type .result-text').textContent;
        const longDescription = results.querySelector('.result-section:last-of-type .result-text').textContent;

        const content = `Image Accessibility Content
Generated on: ${new Date().toLocaleString()}

ALT TEXT:
${altText}

LONG DESCRIPTION:
${longDescription}
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'accessibility-descriptions.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
});
