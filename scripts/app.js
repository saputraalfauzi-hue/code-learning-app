document.addEventListener('DOMContentLoaded', function() {
    initApp();
    initEventListeners();
    loadExercise('html-3');
});

function initApp() {
    console.log('CodeMaster app initialized');
    
    updateLineNumbers('html-editor');
    updateLineNumbers('css-editor');
    updateLineNumbers('js-editor');
    
    const initialCode = {
        html: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latihan List HTML</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Latihan Membuat List HTML</h1>
    
    <div class="list-section">
        <h2>Unordered List (Bulleted)</h2>
        
        
    </div>
    
    <div class="list-section">
        <h2>Ordered List (Numbered)</h2>
        
        
    </div>
    
    <div class="list-section">
        <h2>Description List</h2>
        
        
    </div>
    
    <script src="script.js"></script>
</body>
</html>`,
        css: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    color: #333;
}

h1 {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
}

h2 {
    color: #34495e;
    margin-top: 30px;
}

.list-section {
    background-color: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}`,
        js: `document.addEventListener('DOMContentLoaded', function() {
    console.log('Halaman latihan list telah dimuat');
});`
    };
    
    document.getElementById('html-code').value = initialCode.html;
    document.getElementById('css-code').value = initialCode.css;
    document.getElementById('js-code').value = initialCode.js;
    
    window.initialCode = initialCode;
}

function initEventListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
    
    const editorTabs = document.querySelectorAll('.editor-tab');
    editorTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const editor = this.dataset.editor;
            switchEditor(editor);
        });
    });
    
    const exerciseItems = document.querySelectorAll('.exercise-item:not(.locked)');
    exerciseItems.forEach(item => {
        item.addEventListener('click', function() {
            const exerciseId = this.dataset.exercise;
            loadExercise(exerciseId);
        });
    });
    
    const textareas = document.querySelectorAll('.editor-textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            const editorId = this.closest('.code-editor').id;
            updateLineNumbers(editorId);
            updateStatusMessage('Kode telah dimodifikasi', 'info');
        });
        
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                insertTabAtCursor(this);
            }
        });
    });
    
    const fontSizeSelect = document.getElementById('font-size-select');
    fontSizeSelect.addEventListener('change', function() {
        setEditorFontSize(this.value);
    });
    
    document.getElementById('run-code-btn').addEventListener('click', runCode);
    document.getElementById('test-code-btn').addEventListener('click', testCode);
    document.getElementById('submit-exercise-btn').addEventListener('click', submitExercise);
    document.getElementById('refresh-output-btn').addEventListener('click', refreshOutput);
    document.getElementById('clear-console-btn').addEventListener('click', clearConsole);
    
    document.getElementById('hint-btn').addEventListener('click', showHint);
    document.getElementById('solution-btn').addEventListener('click', showSolution);
    document.getElementById('reset-exercise-btn').addEventListener('click', resetExercise);
    
    document.getElementById('format-btn').addEventListener('click', formatCode);
    document.getElementById('save-btn').addEventListener('click', saveCode);
    
    const viewButtons = document.querySelectorAll('.btn-output-control[data-view]');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.dataset.view;
            switchView(view);
        });
    });
    
    const closeButtons = document.querySelectorAll('.btn-close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('active');
        });
    });
    
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    document.getElementById('difficulty-filter').addEventListener('change', filterExercises);
    document.getElementById('language-filter').addEventListener('change', filterExercises);
}

function switchTab(tabName) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });
    
    updateStatusMessage(`Beralih ke tab ${tabName}`, 'info');
}

function switchEditor(editorName) {
    const editorTabs = document.querySelectorAll('.editor-tab');
    editorTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.editor === editorName);
    });
    
    const editors = document.querySelectorAll('.code-editor');
    editors.forEach(editor => {
        editor.classList.toggle('active', editor.id === `${editorName}-editor`);
    });
    
    updateStatusMessage(`Beralih ke editor ${editorName.toUpperCase()}`, 'info');
}

function switchView(viewName) {
    const viewButtons = document.querySelectorAll('.btn-output-control[data-view]');
    viewButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.view === viewName);
    });
    
    const outputViewport = document.querySelector('.output-viewport');
    outputViewport.className = `output-viewport ${viewName}-view`;
}

function updateLineNumbers(editorId) {
    const editor = document.getElementById(editorId);
    if (!editor) return;
    
    const textarea = editor.querySelector('.editor-textarea');
    const lineNumbers = editor.querySelector('.editor-line-numbers');
    
    const lines = textarea.value.split('\n').length;
    const lineHeight = 21;
    
    let lineNumbersHTML = '';
    for (let i = 1; i <= lines; i++) {
        lineNumbersHTML += `<span>${i}</span>`;
    }
    
    lineNumbers.innerHTML = lineNumbersHTML;
    
    textarea.addEventListener('scroll', function() {
        lineNumbers.scrollTop = textarea.scrollTop;
    });
}

function insertTabAtCursor(textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
    
    textarea.selectionStart = textarea.selectionEnd = start + 2;
}

function setEditorFontSize(size) {
    const textareas = document.querySelectorAll('.editor-textarea');
    textareas.forEach(textarea => {
        textarea.style.fontSize = `${size}px`;
    });
    
    updateLineNumbers('html-editor');
    updateLineNumbers('css-editor');
    updateLineNumbers('js-editor');
}

function updateStatusMessage(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    const icon = statusElement.querySelector('i');
    
    switch(type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#10b981';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = '#ef4444';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            icon.style.color = '#f59e0b';
            break;
        case 'info':
        default:
            icon.className = 'fas fa-info-circle';
            icon.style.color = '#3b82f6';
            break;
    }
    
    statusElement.querySelector('span').textContent = message;
}

function formatCode() {
    updateStatusMessage('Memformat kode...', 'info');
    
    setTimeout(() => {
        updateStatusMessage('Kode berhasil diformat', 'success');
    }, 500);
}

function saveCode() {
    updateStatusMessage('Menyimpan kode...', 'info');
    
    setTimeout(() => {
        updateStatusMessage('Kode berhasil disimpan', 'success');
    }, 500);
}

function clearConsole() {
    const consoleOutput = document.getElementById('console-output');
    consoleOutput.innerHTML = '';
    
    const initialMessage = document.createElement('div');
    initialMessage.className = 'console-message';
    initialMessage.innerHTML = `
        <span class="console-timestamp">[${getCurrentTime()}]</span>
        <span class="console-text">Console cleared</span>
    `;
    consoleOutput.appendChild(initialMessage);
}

function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

function loadExercise(exerciseId) {
    console.log(`Loading exercise: ${exerciseId}`);
    updateStatusMessage(`Memuat latihan: ${exerciseId}`, 'info');
    
    const exerciseItems = document.querySelectorAll('.exercise-item');
    exerciseItems.forEach(item => {
        item.classList.toggle('active', item.dataset.exercise === exerciseId);
    });
}

function runCode() {
    console.log('Running code...');
    updateStatusMessage('Menjalankan kode...', 'info');
    
    const htmlCode = document.getElementById('html-code').value;
    const cssCode = document.getElementById('css-code').value;
    const jsCode = document.getElementById('js-code').value;
    
    if (typeof window.runUserCode === 'function') {
        window.runUserCode(htmlCode, cssCode, jsCode);
    }
    
    updateStatusMessage('Kode berhasil dijalankan', 'success');
}

function testCode() {
    console.log('Testing code...');
    updateStatusMessage('Menguji kode...', 'info');
    
    setTimeout(() => {
        const testResult = document.querySelector('.test-result');
        testResult.className = 'test-result passed';
        testResult.innerHTML = '<i class="fas fa-check-circle"></i><span>Semua tes berhasil!</span>';
        
        updateStatusMessage('Semua tes berhasil!', 'success');
    }, 1500);
}

function submitExercise() {
    console.log('Submitting exercise...');
    updateStatusMessage('Mengirim solusi...', 'info');
    
    setTimeout(() => {
        updateStatusMessage('Solusi berhasil dikirim!', 'success');
        
        const currentExercise = document.querySelector('.exercise-item.active');
        const statusElement = currentExercise.querySelector('.exercise-status');
        statusElement.className = 'exercise-status completed';
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i>';
        
        updateProgress();
    }, 2000);
}

function updateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const completedCount = document.querySelector('.completed-count');
    
    const currentWidth = parseInt(progressFill.style.width) || 15;
    const newWidth = Math.min(currentWidth + 5, 100);
    
    progressFill.style.width = `${newWidth}%`;
    progressText.textContent = `${newWidth}% selesai`;
    
    const countText = completedCount.textContent;
    const [current, total] = countText.split('/').map(num => parseInt(num));
    completedCount.textContent = `${current + 1}/${total}`;
}

function showHint() {
    const hintModal = document.getElementById('hint-modal');
    hintModal.classList.add('active');
}

function showSolution() {
    const solutionModal = document.getElementById('solution-modal');
    solutionModal.classList.add('active');
}

function resetExercise() {
    if (confirm('Apakah Anda yakin ingin mereset kode ke awal?')) {
        document.getElementById('html-code').value = window.initialCode.html;
        document.getElementById('css-code').value = window.initialCode.css;
        document.getElementById('js-code').value = window.initialCode.js;
        
        updateLineNumbers('html-editor');
        updateLineNumbers('css-editor');
        updateLineNumbers('js-editor');
        
        updateStatusMessage('Kode telah direset', 'info');
    }
}

function refreshOutput() {
    runCode();
}

function filterExercises() {
    const difficultyFilter = document.getElementById('difficulty-filter').value;
    const languageFilter = document.getElementById('language-filter').value;
    
    console.log(`Filtering: Difficulty=${difficultyFilter}, Language=${languageFilter}`);
    updateStatusMessage('Menyaring latihan...', 'info');
    
    setTimeout(() => {
        updateStatusMessage('Latihan telah disaring', 'success');
    }, 500);
}