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

// Handle file upload
document.getElementById('contentFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target.result;
        document.getElementById('contentText').value = content;
        showToast(`File "${file.name}" loaded successfully!`);
    };
    
    reader.onerror = () => {
        showError('Failed to read file. Please try again.');
    };
    
    reader.readAsText(file);
});

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
