// API integration for accessibility bot
class AccessibilityAPI {
    constructor(apiEndpoint, apiKey = null) {
        this.apiEndpoint = apiEndpoint;
        this.apiKey = apiKey;
    }

    async generateAltText(imageData, context = '') {
        try {
            const response = await fetch(`${this.apiEndpoint}/generate-alt-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({
                    image: imageData,
                    context: context,
                    type: 'alt-text'
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating alt text:', error);
            throw error;
        }
    }

    async generateLongDescription(imageData, context = '') {
        try {
            const response = await fetch(`${this.apiEndpoint}/generate-long-description`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({
                    image: imageData,
                    context: context,
                    type: 'long-description'
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating long description:', error);
            throw error;
        }
    }

    async generateBoth(imageData, context = '') {
        try {
            const response = await fetch(`${this.apiEndpoint}/generate-descriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({
                    image: imageData,
                    context: context,
                    type: 'both'
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating descriptions:', error);
            throw error;
        }
    }
}

// Image upload and processing utilities
class ImageProcessor {
    static async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static validateImageFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
        }

        if (file.size > maxSize) {
            throw new Error('File too large. Please upload an image smaller than 10MB.');
        }

        return true;
    }
}

// Initialize API (you'll need to set your actual API endpoint)
// const api = new AccessibilityAPI('https://your-api-endpoint.com/api');
// For development/testing, you might use a local endpoint:
// const api = new AccessibilityAPI('http://localhost:3000/api');
