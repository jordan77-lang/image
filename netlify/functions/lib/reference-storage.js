// Permanent reference documents manager
// This will store institutional standards server-side

const fs = require('fs').promises;
const path = require('path');

const REFERENCES_DIR = path.join(process.cwd(), '.references');
const REFERENCES_INDEX = path.join(REFERENCES_DIR, 'index.json');

// Initialize references directory
async function initReferencesDir() {
    try {
        await fs.access(REFERENCES_DIR);
    } catch {
        await fs.mkdir(REFERENCES_DIR, { recursive: true });
        await fs.writeFile(REFERENCES_INDEX, JSON.stringify({ documents: [] }, null, 2));
    }
}

// Load all reference documents
async function loadReferenceDocuments() {
    try {
        await initReferencesDir();
        const indexData = await fs.readFile(REFERENCES_INDEX, 'utf8');
        const index = JSON.parse(indexData);
        
        const documents = [];
        for (const doc of index.documents) {
            try {
                const content = await fs.readFile(path.join(REFERENCES_DIR, doc.filename), 'utf8');
                documents.push({
                    name: doc.name,
                    filename: doc.filename,
                    content: content,
                    uploadedAt: doc.uploadedAt
                });
            } catch (error) {
                console.warn(`Failed to load reference document ${doc.filename}:`, error);
            }
        }
        
        return documents;
    } catch (error) {
        console.error('Failed to load reference documents:', error);
        return [];
    }
}

// Add reference document
async function addReferenceDocument(name, content) {
    try {
        await initReferencesDir();
        
        const filename = `${Date.now()}-${name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filepath = path.join(REFERENCES_DIR, filename);
        
        // Save document content
        await fs.writeFile(filepath, content, 'utf8');
        
        // Update index
        const indexData = await fs.readFile(REFERENCES_INDEX, 'utf8');
        const index = JSON.parse(indexData);
        
        index.documents.push({
            name: name,
            filename: filename,
            uploadedAt: new Date().toISOString()
        });
        
        await fs.writeFile(REFERENCES_INDEX, JSON.stringify(index, null, 2));
        
        return { success: true, filename };
    } catch (error) {
        console.error('Failed to add reference document:', error);
        return { success: false, error: error.message };
    }
}

// Remove reference document
async function removeReferenceDocument(filename) {
    try {
        // Delete file
        await fs.unlink(path.join(REFERENCES_DIR, filename));
        
        // Update index
        const indexData = await fs.readFile(REFERENCES_INDEX, 'utf8');
        const index = JSON.parse(indexData);
        
        index.documents = index.documents.filter(doc => doc.filename !== filename);
        
        await fs.writeFile(REFERENCES_INDEX, JSON.stringify(index, null, 2));
        
        return { success: true };
    } catch (error) {
        console.error('Failed to remove reference document:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    loadReferenceDocuments,
    addReferenceDocument,
    removeReferenceDocument
};
