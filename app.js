// Main application logic for the accessibility tool
document.addEventListener('DOMContentLoaded', function() {
    // Configuration - Auto-detect local vs production
    const API_CONFIG = {
        endpoint: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8888/.netlify/functions' // Local Netlify Dev
            : 'https://image-accessibility-tool.netlify.app/.netlify/functions', // Production
        apiKey: null // API key is handled server-side for security
    };

    const api = new AccessibilityAPI(API_CONFIG.endpoint, API_CONFIG.apiKey);
    
    // DOM elements
    const imageUpload = document.getElementById('image-upload');
    const contextInput = document.getElementById('context-input');
    const contextFileUpload = document.getElementById('context-file-upload');
    const referenceFileUpload = document.getElementById('reference-file-upload');
    const generateBtn = document.getElementById('generate-btn');
    const resultsContainer = document.getElementById('results-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorContainer = document.getElementById('error-container');

    // State
    let currentImage = null;
    let contextFileContent = null;
    let referenceDocuments = [];

    // Event listeners
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }

    if (contextFileUpload) {
        contextFileUpload.addEventListener('change', handleContextFileUpload);
    }

    if (referenceFileUpload) {
        referenceFileUpload.addEventListener('change', handleReferenceFileUpload);
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerate);
    }

    // Handle image upload
    async function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const progressIndicator = document.getElementById('image-upload-progress');
        const progressFill = document.getElementById('image-progress-fill');
        const progressMessage = document.getElementById('image-progress-message');
        const progressPercentage = document.getElementById('image-progress-percentage');

        try {
            // Show progress indicator
            if (progressIndicator) {
                progressIndicator.style.display = 'block';
                if (progressMessage) progressMessage.textContent = 'Validating image...';
                if (progressPercentage) progressPercentage.textContent = '10%';
                if (progressFill) progressFill.style.width = '10%';
            }

            // Validate the image file
            ImageProcessor.validateImageFile(file);
            
            // Update progress
            if (progressIndicator) {
                if (progressMessage) progressMessage.textContent = 'Processing image...';
                if (progressPercentage) progressPercentage.textContent = '50%';
                if (progressFill) progressFill.style.width = '50%';
            }

            // Convert to base64
            currentImage = await ImageProcessor.fileToBase64(file);
            
            // Update progress
            if (progressIndicator) {
                if (progressMessage) progressMessage.textContent = 'Creating preview...';
                if (progressPercentage) progressPercentage.textContent = '80%';
                if (progressFill) progressFill.style.width = '80%';
            }

            // Show preview
            showImagePreview(currentImage, file.name);
            
            // Complete progress
            if (progressIndicator) {
                if (progressMessage) progressMessage.textContent = 'Image ready!';
                if (progressPercentage) progressPercentage.textContent = '100%';
                if (progressFill) progressFill.style.width = '100%';
                
                // Hide progress bar after a short delay
                setTimeout(() => {
                    progressIndicator.style.display = 'none';
                }, 1500);
            }
            
            // Enable generate button
            if (generateBtn) {
                generateBtn.disabled = false;
            }

            clearError();
        } catch (error) {
            // Hide progress indicator on error
            if (progressIndicator) {
                progressIndicator.style.display = 'none';
            }
            
            showError(error.message);
            currentImage = null;
            if (generateBtn) {
                generateBtn.disabled = true;
            }
        }
    }

    // Handle context file upload
    async function handleContextFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const progressIndicator = document.getElementById('context-file-progress');
        const progressMessage = progressIndicator?.querySelector('.progress-message');

        try {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size too large. Maximum 5MB allowed.');
            }

            // Validate file type
            const allowedTypes = ['.txt', '.md', '.pdf'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                throw new Error('Only PDF (.pdf), text (.txt) and Markdown (.md) files are supported.');
            }

            // Show progress indicator
            if (progressIndicator) {
                progressIndicator.style.display = 'block';
                if (progressMessage) {
                    progressMessage.textContent = fileExtension === '.pdf' ? 'Processing PDF... Please wait.' : 'Reading document...';
                }
            }

            let content;
            
            // Handle different file types
            if (fileExtension === '.pdf') {
                content = await extractTextFromPDF(file);
            } else {
                // Read text/markdown files directly
                content = await readTextFile(file);
            }

            contextFileContent = content;
            
            // Hide progress indicator and show preview
            if (progressIndicator) {
                progressIndicator.style.display = 'none';
            }
            
            showContextFilePreview(file, content);

        } catch (error) {
            // Hide progress indicator on error
            if (progressIndicator) {
                progressIndicator.style.display = 'none';
            }
            
            showError('Context file upload failed: ' + error.message);
            contextFileUpload.value = '';
        }
    }

    // Read text file content
    function readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Extract text from PDF file
    async function extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    // Configure PDF.js worker
                    if (typeof pdfjsLib !== 'undefined') {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    }

                    const arrayBuffer = e.target.result;
                    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
                    
                    let fullText = '';
                    
                    // Extract text from each page
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n\n';
                    }
                    
                    if (fullText.trim().length === 0) {
                        reject(new Error('No text found in PDF. The PDF might be image-based or encrypted.'));
                    } else {
                        resolve(fullText.trim());
                    }
                    
                } catch (error) {
                    reject(new Error('Failed to extract text from PDF: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read PDF file'));
            reader.readAsArrayBuffer(file);
        });
    }

    // Show context file preview
    function showContextFilePreview(file, content) {
        const preview = document.getElementById('context-file-preview');
        if (!preview) return;

        const isTextFile = file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md');
        const truncatedContent = content.length > 200 ? content.substring(0, 200) + '...' : content;

        preview.innerHTML = `
            <div class="context-file-info">
                <span class="context-file-name">📎 ${file.name}</span>
                <span class="context-file-size">${formatFileSize(file.size)}</span>
                <button class="context-file-remove" onclick="removeContextFile()">Remove</button>
            </div>
            <div class="context-file-status">
                <p style="color: #059669; font-size: 0.9em; margin: 0.5em 0;">✅ This document will be used for all images until removed</p>
            </div>
            ${isTextFile ? `<div class="context-file-content">${truncatedContent}</div>` : '<p style="color: #666; font-style: italic;">Document content will be included as context for all images.</p>'}
        `;

        preview.style.display = 'block';
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Remove context file
    window.removeContextFile = function() {
        contextFileContent = null;
        contextFileUpload.value = '';
        const preview = document.getElementById('context-file-preview');
        if (preview) {
            preview.style.display = 'none';
        }
    };

    // Handle reference files upload
    async function handleReferenceFileUpload(event) {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        try {
            // Validate total file size (10MB limit)
            const totalSize = files.reduce((sum, file) => sum + file.size, 0);
            if (totalSize > 10 * 1024 * 1024) {
                throw new Error('Total file size too large. Maximum 10MB allowed for all reference documents.');
            }

            // Process each file
            for (const file of files) {
                // Validate file type
                const allowedTypes = ['.txt', '.md'];
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                if (!allowedTypes.includes(fileExtension)) {
                    throw new Error(`Unsupported file type for ${file.name}. Only text (.txt) and Markdown (.md) files are supported.`);
                }

                // Read file content
                const content = await readTextFile(file);
                
                // Add to reference documents (avoid duplicates)
                const existingIndex = referenceDocuments.findIndex(doc => doc.name === file.name);
                if (existingIndex >= 0) {
                    referenceDocuments[existingIndex] = {
                        name: file.name,
                        size: file.size,
                        content: content
                    };
                } else {
                    referenceDocuments.push({
                        name: file.name,
                        size: file.size,
                        content: content
                    });
                }
            }

            showReferenceFilesPreview();
            referenceFileUpload.value = ''; // Clear input for next upload

        } catch (error) {
            showError('Reference file upload failed: ' + error.message);
            referenceFileUpload.value = '';
        }
    }

    // Show reference files preview
    function showReferenceFilesPreview() {
        const preview = document.getElementById('reference-files-preview');
        if (!preview || !referenceDocuments.length) return;

        const itemsHtml = referenceDocuments.map((doc, index) => {
            const truncatedContent = doc.content.length > 150 ? doc.content.substring(0, 150) + '...' : doc.content;
            return `
                <div class="reference-file-item">
                    <div class="reference-file-info">
                        <div class="reference-file-name">${doc.name}</div>
                        <div class="reference-file-size">${formatFileSize(doc.size)}</div>
                        <div class="reference-file-content">${truncatedContent}</div>
                    </div>
                    <button class="reference-file-remove" onclick="removeReferenceFile(${index})">Remove</button>
                </div>
            `;
        }).join('');

        preview.innerHTML = itemsHtml;
        preview.style.display = 'block';
    }

    // Remove reference file
    window.removeReferenceFile = function(index) {
        referenceDocuments.splice(index, 1);
        if (referenceDocuments.length === 0) {
            const preview = document.getElementById('reference-files-preview');
            if (preview) {
                preview.style.display = 'none';
            }
        } else {
            showReferenceFilesPreview();
        }
    };

    // Handle generate button click
    async function handleGenerate() {
        if (!currentImage) {
            showError('Please upload an image first.');
            return;
        }

        // Combine text context and file context
        let context = contextInput ? contextInput.value.trim() : '';
        if (contextFileContent) {
            context = context ? `${context}\n\nAdditional Context: ${contextFileContent}` : contextFileContent;
        }

        // Add reference documents as guidance
        if (referenceDocuments.length > 0) {
            const referenceContent = referenceDocuments.map(doc => 
                `--- Reference: ${doc.name} ---\n${doc.content}`
            ).join('\n\n');
            
            context = context ? 
                `${context}\n\n=== REFERENCE MATERIALS ===\nPlease align your output with these curriculum standards and examples:\n\n${referenceContent}` :
                `=== REFERENCE MATERIALS ===\nPlease align your output with these curriculum standards and examples:\n\n${referenceContent}`;
        }
        
        try {
            showLoading(true);
            clearError();
            
            console.log('🚀 Starting generation with endpoint:', API_CONFIG.endpoint);
            console.log('📷 Image data length:', currentImage ? currentImage.length : 0);
            console.log('📝 Context length:', context ? context.length : 0);
            
            // Generate both alt text and long description
            const result = await api.generateBoth(currentImage, context);
            console.log('✅ Generation successful:', result);
            
            showResults(result);
        } catch (error) {
            console.error('❌ Generation failed:', error);
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
        const figureDescription = result.figureDescription || result.figure_description || '';
        const longDescription = result.longDescription || result.long_description || '';
        const transcribedText = result.transcribedText || result.transcribed_text || '';

        let figureDescSection = '';
        if (figureDescription) {
            figureDescSection = `
                <div class="result-section">
                    <h4>Figure Description</h4>
                    <div class="result-content">
                        <p class="result-text">${figureDescription}</p>
                        <button class="copy-btn" onclick="copyToClipboard('${figureDescription.replace(/'/g, "\\'")}', 'Figure Description')">
                            📋 Copy Figure Description
                        </button>
                    </div>
                </div>
            `;
        }

        let transcribedSection = '';
        if (transcribedText && transcribedText !== 'No text visible in image') {
            transcribedSection = `
                <div class="result-section">
                    <h4>Transcribed Text</h4>
                    <div class="result-content">
                        <pre class="result-text transcribed-text">${transcribedText}</pre>
                        <button class="copy-btn" onclick="copyToClipboard('${transcribedText.replace(/'/g, "\\'")}', 'Transcribed Text')">
                            📋 Copy Transcribed Text
                        </button>
                    </div>
                </div>
            `;
        }

        // Calculate alt text character count and validation
        const altTextLength = altText.length;
        const isValidLength = altTextLength <= 120;
        const lengthClass = isValidLength ? 'char-count-valid' : 'char-count-invalid';

        resultsContainer.innerHTML = `
            <div class="results">
                <h3>Generated Accessibility Content</h3>
                
                <div class="result-section">
                    <div class="section-header">
                        <h4>Alt Text</h4>
                        <span class="character-count ${lengthClass}">
                            ${altTextLength}/120 characters
                            ${!isValidLength ? ' ⚠️' : ' ✓'}
                        </span>
                    </div>
                    <div class="result-content">
                        <p class="result-text ${!isValidLength ? 'text-too-long' : ''}">${altText}</p>
                        <button class="copy-btn" onclick="copyToClipboard('${altText.replace(/'/g, "\\'")}', 'Alt Text')">
                            📋 Copy Alt Text
                        </button>
                    </div>
                </div>

                ${figureDescSection}

                <div class="result-section">
                    <h4>Long Description</h4>
                    <div class="result-content">
                        <p class="result-text">${longDescription}</p>
                        <button class="copy-btn" onclick="copyToClipboard('${longDescription.replace(/'/g, "\\'")}', 'Long Description')">
                            📋 Copy Long Description
                        </button>
                    </div>
                </div>

                ${transcribedSection}

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

    // Helper function to count characters accurately
    function countCharacters(text) {
        // Count only visible characters as read by screen readers
        return text.length;
    }

    // Helper function to validate alt text length
    function validateAltTextLength(text) {
        const length = countCharacters(text);
        return {
            length: length,
            isValid: length <= 120,
            message: length <= 120 ? '✓' : '⚠️'
        };
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

        const sections = results.querySelectorAll('.result-section');
        const altText = sections[0]?.querySelector('.result-text')?.textContent || '';
        
        let figureDescription = '';
        let longDescription = '';
        let transcribedText = '';
        
        // Parse sections based on number present
        if (sections.length >= 2) {
            longDescription = sections[1]?.querySelector('.result-text')?.textContent || '';
        }
        if (sections.length >= 3) {
            // Could be: alt, figure, long OR alt, long, transcribed
            const secondTitle = sections[1]?.querySelector('h4')?.textContent || '';
            if (secondTitle === 'Figure Description') {
                figureDescription = sections[1]?.querySelector('.result-text')?.textContent || '';
                longDescription = sections[2]?.querySelector('.result-text')?.textContent || '';
                if (sections.length >= 4) {
                    transcribedText = sections[3]?.querySelector('.result-text')?.textContent || '';
                }
            } else if (secondTitle === 'Long Description') {
                longDescription = sections[1]?.querySelector('.result-text')?.textContent || '';
                transcribedText = sections[2]?.querySelector('.result-text')?.textContent || '';
            }
        }
        if (sections.length >= 4) {
            // alt, figure, long, transcribed
            figureDescription = sections[1]?.querySelector('.result-text')?.textContent || '';
            longDescription = sections[2]?.querySelector('.result-text')?.textContent || '';
            transcribedText = sections[3]?.querySelector('.result-text')?.textContent || '';
        }

        let content = `Image Accessibility Content
Generated on: ${new Date().toLocaleString()}

ALT TEXT:
${altText}
`;

        if (figureDescription) {
            content += `
FIGURE DESCRIPTION:
${figureDescription}
`;
        }

        content += `
LONG DESCRIPTION:
${longDescription}
`;

        if (transcribedText && transcribedText !== 'No text visible in image') {
            content += `
TRANSCRIBED TEXT:
${transcribedText}
`;
        }

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

    // Copy to clipboard functionality with success feedback
    window.copyToClipboard = async function(text, type) {
        try {
            await navigator.clipboard.writeText(text);
            showSuccessMessage(`${type} copied to clipboard! ✨`);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showSuccessMessage(`${type} copied to clipboard! ✨`);
        }
    };

    // Show success message with animation
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        // Trigger animation
        setTimeout(() => successDiv.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.classList.remove('show');
            setTimeout(() => document.body.removeChild(successDiv), 300);
        }, 3000);
    }

    // Enhanced loading states
    function showEnhancedLoading(message) {
        if (loadingIndicator) {
            loadingIndicator.innerHTML = `
                <div class="enhanced-loading">
                    <div class="loading-spinner"></div>
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <p class="loading-message">${message}</p>
                    </div>
                </div>
            `;
            loadingIndicator.style.display = 'block';
        }
    }

    // Update loading messages for PDF processing
    const originalHandleContextFileUpload = handleContextFileUpload;
    handleContextFileUpload = async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.name.toLowerCase().endsWith('.pdf')) {
            showEnhancedLoading('Processing PDF... Extracting text content');
        }
        
        return originalHandleContextFileUpload.call(this, event);
    };

    // Dark mode toggle functionality
    window.toggleDarkMode = function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) {
            toggle.textContent = isDark ? '☀️' : '🌙';
        }
    };

    // Initialize dark mode from localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});
