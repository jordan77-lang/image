// Netlify function to manage permanent reference documents
const { loadReferenceDocuments, addReferenceDocument, removeReferenceDocument } = require('./lib/reference-storage');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        switch (event.httpMethod) {
            case 'GET':
                // Load all permanent reference documents
                const documents = await loadReferenceDocuments();
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        documents: documents,
                        count: documents.length 
                    })
                };

            case 'POST':
                // Add new permanent reference document
                const { name, content } = JSON.parse(event.body);
                
                if (!name || !content) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Name and content are required' })
                    };
                }

                const addResult = await addReferenceDocument(name, content);
                
                if (addResult.success) {
                    return {
                        statusCode: 201,
                        headers,
                        body: JSON.stringify({ 
                            success: true, 
                            filename: addResult.filename,
                            message: `Reference document "${name}" added successfully`
                        })
                    };
                } else {
                    return {
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({ error: addResult.error })
                    };
                }

            case 'DELETE':
                // Remove permanent reference document
                const { filename } = JSON.parse(event.body);
                
                if (!filename) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Filename is required' })
                    };
                }

                const removeResult = await removeReferenceDocument(filename);
                
                if (removeResult.success) {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ 
                            success: true,
                            message: 'Reference document removed successfully'
                        })
                    };
                } else {
                    return {
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({ error: removeResult.error })
                    };
                }

            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error('Reference documents API error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error', 
                detail: error.message 
            })
        };
    }
};
