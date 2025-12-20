(function() {
    'use strict';
    
    const highlightKeywords = {
        html: ['<!DOCTYPE', '<html', '<head', '<title', '<body', '<div', '<h1', '<h2', '<p', '<ul', '<ol', '<li', '<dl', '<dt', '<dd', '<class', '<id', 'lang=', 'charset='],
        css: ['body', 'h1', 'h2', 'p', '.list-section', 'color', 'background', 'padding', 'margin', 'font-family', 'border', 'border-radius', 'box-shadow'],
        js: ['document', 'addEventListener', 'getElementById', 'querySelector', 'console', 'log', 'function', 'if', 'else', 'for', 'while', 'const', 'let', 'var']
    };
    
    function highlightCode(element, language) {
        if (!element || !language) return;
        
        const keywords = highlightKeywords[language] || [];
        let code = element.value;
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            code = code.replace(regex, '<span class="keyword">$1</span>');
        });
        
        const lineNumbers = element.parentElement.querySelector('.editor-line-numbers');
        if (lineNumbers) {
            const lines = code.split('\n').length;
            lineNumbers.innerHTML = '';
            for (let i = 1; i <= lines; i++) {
                const lineSpan = document.createElement('span');
                lineSpan.textContent = i;
                lineNumbers.appendChild(lineSpan);
            }
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        const textareas = document.querySelectorAll('.editor-textarea');
        
        textareas.forEach(textarea => {
            textarea.addEventListener('input', function() {
                const editor = this.closest('.code-editor');
                if (editor.id === 'html-editor') {
                    highlightCode(this, 'html');
                } else if (editor.id === 'css-editor') {
                    highlightCode(this, 'css');
                } else if (editor.id === 'js-editor') {
                    highlightCode(this, 'js');
                }
            });
        });
        
        setTimeout(() => {
            const htmlTextarea = document.getElementById('html-code');
            const cssTextarea = document.getElementById('css-code');
            const jsTextarea = document.getElementById('js-code');
            
            if (htmlTextarea) highlightCode(htmlTextarea, 'html');
            if (cssTextarea) highlightCode(cssTextarea, 'css');
            if (jsTextarea) highlightCode(jsTextarea, 'js');
        }, 100);
    });
})();