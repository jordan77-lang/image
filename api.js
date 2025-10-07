// API integration for accessibility bot
class AccessibilityAPI {
    constructor(apiEndpoint, apiKey = null) {
        this.apiEndpoint = apiEndpoint;
        this.apiKey = apiKey;
    }



    async generateBoth(imageData, context = '') {
        try {
            console.log('🌐 Making API request to:', `${this.apiEndpoint}/generate-descriptions`);
            
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

            console.log('📡 API Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ API Success:', result);
            return result;
        } catch (error) {
            console.error('💥 API Call Failed:', error);
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
