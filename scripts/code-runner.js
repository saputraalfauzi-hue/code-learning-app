(function() {
    'use strict';
    
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    window.runUserCode = function(html, css, js) {
        const outputFrame = document.getElementById('output-frame');
        const consoleOutput = document.getElementById('console-output');
        
        if (!outputFrame || !consoleOutput) return;
        
        consoleOutput.innerHTML = '';
        
        console.log = function(...args) {
            originalConsoleLog.apply(console, args);
            logToConsole('log', args);
        };
        
        console.error = function(...args) {
            originalConsoleError.apply(console, args);
            logToConsole('error', args);
        };
        
        console.warn = function(...args) {
            originalConsoleWarn.apply(console, args);
            logToConsole('warn', args);
        };
        
        try {
            const doc = outputFrame.contentDocument || outputFrame.contentWindow.document;
            
            doc.open();
            doc.write(html);
            doc.close();
            
            const style = doc.createElement('style');
            style.textContent = css;
            doc.head.appendChild(style);
            
            const script = doc.createElement('script');
            script.textContent = `
                try {
                    ${js}
                } catch(error) {
                    console.error('JavaScript Error:', error);
                }
            `;
            doc.body.appendChild(script);
            
        } catch (error) {
            console.error('Error running code:', error);
            logToConsole('error', [`Runtime Error: ${error.message}`]);
        } finally {
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
        }
        
        function logToConsole(type, args) {
            const timestamp = `[${getCurrentTime()}]`;
            const message = args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch {
                        return String(arg);
                    }
                }
                return String(arg);
            }).join(' ');
            
            const consoleMessage = document.createElement('div');
            consoleMessage.className = 'console-message';
            consoleMessage.innerHTML = `
                <span class="console-timestamp">${timestamp}</span>
                <span class="console-text ${type}">${message}</span>
            `;
            
            consoleOutput.appendChild(consoleMessage);
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }
        
        function getCurrentTime() {
            const now = new Date();
            return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        }
    };
    
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            const html = document.getElementById('html-code').value;
            const css = document.getElementById('css-code').value;
            const js = document.getElementById('js-code').value;
            
            window.runUserCode(html, css, js);
        }, 500);
    });
})();