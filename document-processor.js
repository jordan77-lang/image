// Enhanced document processor with PDF support
class DocumentProcessor {
    
    static async extractTextFromFile(file) {
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        switch (fileExtension) {
            case '.txt':
            case '.md':
                return await this.readTextFile(file);
            case '.pdf':
                return await this.extractPDFText(file);
            case '.doc':
            case '.docx':
                // Word files require server-side processing or specialized libraries
                return `[Word Document: ${file.name}] - Consider converting to PDF or text format for full content extraction.`;
            default:
                throw new Error('Unsupported file type');
        }
    }
    
    static readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
    
    static async extractPDFText(file) {
        try {
            // Load PDF.js library (would need to be included in HTML)
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js library not loaded. Please include PDF.js to process PDF files.');
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            
            // Extract text from each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += `Page ${pageNum}: ${pageText}\n\n`;
            }
            
            return fullText;
            
        } catch (error) {
            console.error('PDF extraction failed:', error);
            return `[PDF Document: ${file.name}] - PDF text extraction failed. Consider converting to text format.`;
        }
    }
}

export default DocumentProcessor;
