// Netlify function for document text extraction
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth'); // For Word documents

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // Parse multipart form data (would need additional setup)
        const contentType = event.headers['content-type'] || '';
        
        if (!contentType.includes('multipart/form-data')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Expected multipart/form-data' }),
            };
        }

        // Extract file from form data (simplified - would need proper parsing)
        const fileBuffer = Buffer.from(event.body, 'base64');
        const filename = event.headers['x-filename'] || 'document';
        const fileExtension = filename.split('.').pop().toLowerCase();

        let extractedText = '';

        switch (fileExtension) {
            case 'pdf':
                const pdfData = await pdfParse(fileBuffer);
                extractedText = pdfData.text;
                break;
                
            case 'docx':
                const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
                extractedText = docxResult.value;
                break;
                
            case 'doc':
                // Legacy .doc files are more complex - may need different approach
                extractedText = '[Legacy .doc files require special processing]';
                break;
                
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Unsupported file type' }),
                };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                filename: filename,
                extractedText: extractedText,
                characterCount: extractedText.length
            }),
        };

    } catch (error) {
        console.error('Document processing error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Document processing failed', detail: error.message }),
        };
    }
};
