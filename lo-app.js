// Learning Objectives Generator - Frontend Logic
let currentResults = null;

// Toggle advanced options
function toggleAdvanced() {
    const options = document.getElementById('advancedOptions');
    const arrow = document.getElementById('advancedArrow');
    
    if (options.classList.contains('open')) {
        options.classList.remove('open');
        arrow.textContent = '▼';
    } else {
        options.classList.add('open');
        arrow.textContent = '▲';
    }
}

// Clear form
function clearForm() {
    document.getElementById('loForm').reset();
    document.getElementById('outputSection').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
}

// Handle file upload with PDF-aware extraction
document.getElementById('contentFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const textarea = document.getElementById('contentText');
    const progress = document.getElementById('contentFileProgress');
    const progressLabel = document.getElementById('contentFileProgressLabel');
    const progressFill = document.getElementById('contentFileProgressFill');

    const fileExtension = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const supportedTypes = ['.txt', '.md', '.pdf'];

    if (!supportedTypes.includes(fileExtension)) {
        showError('Unsupported file type. Please upload a PDF, TXT, or MD file.');
        e.target.value = '';
        return;
    }

    const showProgress = () => { if (progress) progress.style.display = 'block'; };
    const hideProgress = () => { if (progress) progress.style.display = 'none'; };
    const setProgress = (percent, label) => {
        if (progressFill) progressFill.style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
        if (progressLabel) progressLabel.textContent = label;
    };

    try {
        showProgress();
        setProgress(5, 'Preparing file...');

        let content;
        if (fileExtension === '.pdf') {
            textarea.value = 'Processing PDF... extracting text (images are ignored).';
            content = await extractTextFromPDF(file, setProgress);
        } else {
            content = await readTextFile(file);
        }

        setProgress(100, 'Done');
        setTimeout(hideProgress, 400);

        textarea.value = content;
        showToast(`File "${file.name}" loaded successfully!`);
    } catch (err) {
        console.error('File load error:', err);
        showError(err.message || 'Failed to read file. Please try again.');
        textarea.value = '';
        hideProgress();
    }
});

// Read text-based files
function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Failed to read file. Please try again.'));
        reader.readAsText(file);
    });
}

// Quick check for binary/gibberish output so we can fail fast instead of pasting unreadable text
function looksLikeGibberish(text) {
    if (!text) return true;
    const total = text.length;
    const replacementCount = (text.match(/\uFFFD/g) || []).length;
    const controlCount = (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
    const longGarbageRun = /�{3,}/.test(text);
    const garbageRatio = (replacementCount + controlCount) / total;
    return longGarbageRun || garbageRatio > 0.05;
}

// Extract text from PDF using pdf.js while ignoring images
async function extractTextFromPDF(file, setProgress) {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF processing library failed to load. Please refresh and try again.');
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();

    // Quick signature check to avoid reading non-PDFs as binary text
    const asciiHeader = new TextDecoder('ascii', { fatal: false }).decode(arrayBuffer.slice(0, 8));
    if (!asciiHeader.includes('%PDF')) {
        throw new Error('This file does not look like a valid PDF. Please upload a real PDF or a text/markdown file.');
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    if (setProgress) {
        loadingTask.onProgress = ({ loaded, total }) => {
            if (!total) return;
            const pct = Math.round((loaded / total) * 50); // first half while downloading
            setProgress(pct, `Loading PDF... ${pct}%`);
        };
    }

    const pdf = await loadingTask.promise;
    if (setProgress) setProgress(55, 'Parsing pages...');

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false });

        // Rebuild text with line and word spacing inferred from coordinates
        let lastY = null;
        let lastX = null;
        let currentLine = '';
        const lines = [];
        const yTolerance = 5; // pixels
        const xTolerance = 4; // pixels between words

        textContent.items.forEach((item) => {
            if (!item.str || !item.str.trim()) return; // ignore empty runs and non-text

            const [ , , , , x, y ] = item.transform; // transform matrix stores x/y
            if (lastY !== null && Math.abs(y - lastY) > yTolerance) {
                if (currentLine.trim()) lines.push(currentLine.trim());
                currentLine = '';
                lastX = null;
            } else if (lastX !== null && x - lastX > xTolerance) {
                currentLine += ' ';
            }

            currentLine += item.str.replace(/\s+/g, ' ');
            lastY = y;

            // Advance x by width when available to better space words
            const advance = item.width || 0;
            lastX = x + advance;
        });

        if (currentLine.trim()) lines.push(currentLine.trim());
        const pageText = lines.join('\n');
        if (pageText.trim()) {
            fullText += pageText + '\n\n';
        }

        if (setProgress) {
            const pct = 55 + Math.round((pageNum / pdf.numPages) * 40); // use 40% for page parsing
            setProgress(pct, `Extracting text... page ${pageNum} of ${pdf.numPages}`);
        }
    }

    const cleaned = fullText
        .replace(/[\u2010-\u2014]/g, '-')
        .replace(/\s+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (!cleaned) {
        throw new Error('No selectable text found in this PDF. It may be image-only or encrypted.');
    }

    if (looksLikeGibberish(cleaned)) {
        throw new Error('The PDF text looks corrupted or image-only. Please run OCR or upload a text-based PDF.');
    }

    return cleaned;
}

// Handle form submission
document.getElementById('loForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const contentText = document.getElementById('contentText').value.trim();
    const audienceLevel = document.getElementById('audienceLevel').value;
    const subjectArea = document.getElementById('subjectArea').value.trim();
    const objectiveScope = document.getElementById('objectiveScope').value;
    const framework = document.getElementById('framework').value;
    const numObjectivesInput = document.getElementById('numObjectives').value;
    const numObjectives = numObjectivesInput === 'auto' || numObjectivesInput === '' ? 'auto' : parseInt(numObjectivesInput);
    
    if (!contentText) {
        showError('Please enter or upload course content to analyze.');
        return;
    }
    
    // Show loading state
    document.getElementById('outputSection').classList.add('hidden');
    document.getElementById('loadingSection').classList.remove('hidden');
    document.getElementById('generateBtn').disabled = true;
    
    try {
        // Call Netlify Function
        const response = await fetch('/.netlify/functions/generate-learning-objectives', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content_text: contentText,
                audience_level: audienceLevel,
                subject_area: subjectArea || null,
                objective_scope: objectiveScope,
                framework: framework,
                num_objectives: numObjectives
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        currentResults = data;
        
        // Display results
        displayResults(data);
        
    } catch (error) {
        console.error('Error generating learning objectives:', error);
        showError(`Failed to generate learning objectives: ${error.message}`);
    } finally {
        document.getElementById('loadingSection').classList.add('hidden');
        document.getElementById('generateBtn').disabled = false;
    }
});

// Display results in table
function displayResults(data) {
    const tableBody = document.getElementById('resultsTableBody');
    tableBody.innerHTML = '';
    
    if (!data.learning_objectives || data.learning_objectives.length === 0) {
        showError('No learning objectives were generated. Please try with different content.');
        return;
    }
    
    data.learning_objectives.forEach((lo) => {
        const row = document.createElement('tr');
        row.id = lo.id;
        
        // ID column
        const idCell = document.createElement('td');
        idCell.className = 'lo-id';
        idCell.textContent = lo.id;
        row.appendChild(idCell);
        
        // Objective text column
        const textCell = document.createElement('td');
        textCell.className = 'lo-text';
        textCell.textContent = lo.objective_text;
        row.appendChild(textCell);
        
        // Alignment column
        const alignmentCell = document.createElement('td');
        alignmentCell.className = 'lo-alignment';
        alignmentCell.textContent = lo.alignment || 'No specific standard alignment';
        row.appendChild(alignmentCell);
        
        // Actions column
        const actionsCell = document.createElement('td');
        actionsCell.className = 'action-buttons';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-icon';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => copyObjective(lo);
        actionsCell.appendChild(copyBtn);
        
        const copyAlignBtn = document.createElement('button');
        copyAlignBtn.className = 'btn-icon';
        copyAlignBtn.textContent = 'Copy Align';
        copyAlignBtn.onclick = () => copyAlignment(lo);
        actionsCell.appendChild(copyAlignBtn);
        
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });
    
    // Show output section
    document.getElementById('outputSection').classList.remove('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
    
    // Scroll to results
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

// Copy single objective to clipboard
function copyObjective(lo) {
    const text = `${lo.id}. ${lo.objective_text}`;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Objective copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showError('Failed to copy to clipboard');
    });
}

// Copy alignment text to clipboard
function copyAlignment(lo) {
    const text = lo.alignment || 'No specific standard alignment';
    navigator.clipboard.writeText(text).then(() => {
        showToast('Alignment copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showError('Failed to copy to clipboard');
    });
}

// Copy all objectives
function copyAllObjectives() {
    if (!currentResults || !currentResults.learning_objectives) {
        showError('No objectives to copy');
        return;
    }
    
    let text = 'LEARNING OBJECTIVES\n\n';
    currentResults.learning_objectives.forEach((lo) => {
        text += `${lo.id}. ${lo.objective_text}\n`;
        if (lo.alignment) {
            text += `   Standards: ${lo.alignment}\n`;
        }
        text += '\n';
    });
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('All objectives copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showError('Failed to copy to clipboard');
    });
}

// Download JSON
function downloadJSON() {
    if (!currentResults) {
        showError('No results to download');
        return;
    }
    
    const dataStr = JSON.stringify(currentResults, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-objectives-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('JSON file downloaded!');
}

// Download CSV table
function downloadCSV() {
    if (!currentResults || !currentResults.learning_objectives) {
        showError('No objectives to download');
        return;
    }
    
    // Create CSV content with headers
    let csv = '#,Learning Objective,Alignment\n';
    
    currentResults.learning_objectives.forEach((lo) => {
        // Escape quotes and wrap fields with commas/quotes in double quotes
        const id = lo.id || '';
        const objective = (lo.objective_text || '').replace(/"/g, '""');
        const alignment = (lo.alignment || '').replace(/"/g, '""');
        
        csv += `"${id}","${objective}","${alignment}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-objectives-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('CSV file downloaded!');
}

// Regenerate with same inputs
function regenerate() {
    document.getElementById('loForm').dispatchEvent(new Event('submit'));
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    document.getElementById('outputSection').classList.remove('hidden');
}

// Show toast notification
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
