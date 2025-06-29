// Calculator State
class Calculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.history = '';
        this.shouldResetDisplay = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        this.displayCurrent = document.getElementById('current');
        this.displayHistory = document.getElementById('history');
        this.numberButtons = document.querySelectorAll('[data-number]');
        this.operatorButtons = document.querySelectorAll('[data-action]');
    }

    attachEventListeners() {
        // Number buttons
        this.numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.inputNumber(button.dataset.number);
                this.animateButton(button);
            });
        });

        // Operator and function buttons
        this.operatorButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleAction(button.dataset.action);
                this.animateButton(button);
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Demo buttons
        this.setupDemoButtons();

        // Calculator controls
        this.setupCalculatorControls();
    }

    inputNumber(num) {
        if (this.waitingForOperand || this.shouldResetDisplay) {
            this.currentValue = num;
            this.waitingForOperand = false;
            this.shouldResetDisplay = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }

    handleAction(action) {
        const current = parseFloat(this.currentValue);

        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'clear-entry':
                this.clearEntry();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'toggle-sign':
                this.toggleSign();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.handleOperator(action);
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }

    handleOperator(nextOperator) {
        const inputValue = parseFloat(this.currentValue);

        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operator && !this.waitingForOperand) {
            const currentValue = this.previousValue || 0;
            const newValue = this.performCalculation(this.operator, currentValue, inputValue);

            this.currentValue = String(newValue);
            this.previousValue = newValue;
            this.updateDisplay();
        }

        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateHistory();
    }

    calculate() {
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);

        if (this.previousValue !== null && this.operator && !this.waitingForOperand) {
            const newValue = this.performCalculation(this.operator, prev, current);
            
            this.history = `${this.formatNumber(prev)} ${this.getOperatorSymbol(this.operator)} ${this.formatNumber(current)} =`;
            this.currentValue = String(newValue);
            this.previousValue = null;
            this.operator = null;
            this.waitingForOperand = false;
            this.shouldResetDisplay = true;
            
            this.updateDisplay();
        }
    }

    performCalculation(operator, firstValue, secondValue) {
        switch (operator) {
            case 'add':
                return this.roundToDecimal(firstValue + secondValue);
            case 'subtract':
                return this.roundToDecimal(firstValue - secondValue);
            case 'multiply':
                return this.roundToDecimal(firstValue * secondValue);
            case 'divide':
                if (secondValue === 0) {
                    this.showError('Cannot divide by zero');
                    return 0;
                }
                return this.roundToDecimal(firstValue / secondValue);
            default:
                return secondValue;
        }
    }

    roundToDecimal(num, decimals = 8) {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.history = '';
        this.shouldResetDisplay = false;
        this.updateDisplay();
    }

    clearEntry() {
        this.currentValue = '0';
        this.updateDisplay();
    }

    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForOperand || this.shouldResetDisplay) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
            this.shouldResetDisplay = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }

    toggleSign() {
        if (this.currentValue !== '0') {
            if (this.currentValue.charAt(0) === '-') {
                this.currentValue = this.currentValue.slice(1);
            } else {
                this.currentValue = '-' + this.currentValue;
            }
            this.updateDisplay();
        }
    }

    getOperatorSymbol(operator) {
        const symbols = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷'
        };
        return symbols[operator] || operator;
    }

    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        
        const numStr = String(num);
        if (numStr.length > 12) {
            return parseFloat(num).toExponential(6);
        }
        return numStr;
    }

    updateHistory() {
        if (this.previousValue !== null && this.operator) {
            this.history = `${this.formatNumber(this.previousValue)} ${this.getOperatorSymbol(this.operator)}`;
        }
    }

    updateDisplay() {
        this.displayCurrent.textContent = this.formatNumber(this.currentValue);
        this.displayHistory.textContent = this.history;
        
        // Auto-resize font if number is too long
        this.adjustFontSize();
    }

    adjustFontSize() {
        const maxLength = 10;
        const currentLength = this.displayCurrent.textContent.length;
        
        if (currentLength > maxLength) {
            const fontSize = Math.max(1.5, 3 - (currentLength - maxLength) * 0.1);
            this.displayCurrent.style.fontSize = `${fontSize}rem`;
        } else {
            this.displayCurrent.style.fontSize = '2.25rem';
        }
    }

    showError(message) {
        this.displayCurrent.textContent = 'Error';
        this.history = message;
        this.displayHistory.textContent = this.history;
        
        setTimeout(() => {
            this.clear();
        }, 2000);
    }

    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    handleKeyPress(e) {
        e.preventDefault();
        
        // Numbers
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        }
        
        // Operators
        switch (e.key) {
            case '+':
                this.handleAction('add');
                break;
            case '-':
                this.handleAction('subtract');
                break;
            case '*':
                this.handleAction('multiply');
                break;
            case '/':
                this.handleAction('divide');
                break;
            case '=':
            case 'Enter':
                this.handleAction('equals');
                break;
            case '.':
                this.handleAction('decimal');
                break;
            case 'Backspace':
                this.handleAction('backspace');
                break;
            case 'Escape':
                this.handleAction('clear');
                break;
            case 'Delete':
                this.handleAction('clear-entry');
                break;
        }
    }

    setupDemoButtons() {
        // Try Calculator button
        const tryCalcBtn = document.getElementById('try-calculator');
        if (tryCalcBtn) {
            tryCalcBtn.addEventListener('click', () => {
                document.getElementById('calculator').scrollIntoView({ 
                    behavior: 'smooth' 
                });
                this.demoCalculation();
            });
        }

        // View Code button
        const viewCodeBtn = document.getElementById('view-code');
        if (viewCodeBtn) {
            viewCodeBtn.addEventListener('click', () => {
                this.showCodeModal();
            });
        }

        // Footer demo buttons
        const demoCalcBtn = document.getElementById('demo-calc');
        const clickHereBtn = document.getElementById('click-here');
        
        if (demoCalcBtn) {
            demoCalcBtn.addEventListener('click', () => {
                this.demoCalculation();
                this.showNotification('Demo calculation started!', 'info');
            });
        }
        
        if (clickHereBtn) {
            clickHereBtn.addEventListener('click', () => {
                document.getElementById('calculator').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }
    }

    setupCalculatorControls() {
        // Calculator header controls
        const minimizeBtn = document.getElementById('minimize');
        const maximizeBtn = document.getElementById('maximize');
        const closeBtn = document.getElementById('close');

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.minimizeCalculator();
            });
        }

        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                this.maximizeCalculator();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.showCloseConfirmation();
            });
        }

        // Mode toggle
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (btn.dataset.mode === 'scientific') {
                    this.showNotification('Scientific mode coming soon!', 'info');
                }
            });
        });
    }

    demoCalculation() {
        // Perform a demo calculation: 123 + 456 = 579
        const steps = [
            { action: 'clear', delay: 500 },
            { action: 'number', value: '1', delay: 300 },
            { action: 'number', value: '2', delay: 300 },
            { action: 'number', value: '3', delay: 300 },
            { action: 'operator', value: 'add', delay: 500 },
            { action: 'number', value: '4', delay: 300 },
            { action: 'number', value: '5', delay: 300 },
            { action: 'number', value: '6', delay: 300 },
            { action: 'equals', delay: 500 }
        ];

        let currentStep = 0;
        
        const executeStep = () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                
                switch (step.action) {
                    case 'clear':
                        this.clear();
                        break;
                    case 'number':
                        this.inputNumber(step.value);
                        this.highlightButton(`[data-number="${step.value}"]`);
                        break;
                    case 'operator':
                        this.handleAction(step.value);
                        this.highlightButton(`[data-action="${step.value}"]`);
                        break;
                    case 'equals':
                        this.calculate();
                        this.highlightButton('[data-action="equals"]');
                        break;
                }
                
                currentStep++;
                setTimeout(executeStep, step.delay);
            }
        };
        
        executeStep();
    }

    highlightButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            button.style.background = '#00ff88';
            setTimeout(() => {
                button.style.background = '';
            }, 200);
        }
    }

    minimizeCalculator() {
        const calculator = document.querySelector('.calculator');
        calculator.style.transform = 'scale(0.8)';
        calculator.style.opacity = '0.7';
        
        setTimeout(() => {
            calculator.style.transform = 'scale(1)';
            calculator.style.opacity = '1';
        }, 1000);
        
        this.showNotification('Calculator minimized (demo)', 'info');
    }

    maximizeCalculator() {
        const calculator = document.querySelector('.calculator');
        calculator.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            calculator.style.transform = 'scale(1)';
        }, 300);
        
        this.showNotification('Calculator maximized (demo)', 'info');
    }

    showCloseConfirmation() {
        const confirmed = confirm('Are you sure you want to close the calculator?');
        if (confirmed) {
            this.clear();
            this.showNotification('Calculator reset!', 'success');
        }
    }

    showCodeModal() {
        const modal = document.createElement('div');
        modal.className = 'code-modal-overlay';
        modal.innerHTML = `
            <div class="code-modal">
                <div class="code-modal-header">
                    <h3>Calculator JavaScript Code</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="code-modal-content">
                    <div class="code-tabs">
                        <button class="code-tab active" data-lang="js">JavaScript</button>
                        <button class="code-tab" data-lang="html">HTML</button>
                        <button class="code-tab" data-lang="css">CSS</button>
                    </div>
                    <div class="code-display">
                        <pre><code id="code-content">// Calculator Class
class Calculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentValue = num;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }

    handleOperator(nextOperator) {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousValue || 0;
            const newValue = this.calculate(this.operator, currentValue, inputValue);
            
            this.currentValue = String(newValue);
            this.previousValue = newValue;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
    }

    calculate(operator, firstValue, secondValue) {
        switch (operator) {
            case '+': return firstValue + secondValue;
            case '-': return firstValue - secondValue;
            case '*': return firstValue * secondValue;
            case '/': return firstValue / secondValue;
            default: return secondValue;
        }
    }
}</code></pre>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Modal event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Code tab switching
        const tabs = modal.querySelectorAll('.code-tab');
        const codeContent = modal.querySelector('#code-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const lang = tab.dataset.lang;
                codeContent.textContent = this.getCodeExample(lang);
            });
        });

        // Add modal styles
        this.addModalStyles();
    }

    getCodeExample(lang) {
        const examples = {
            js: `// Calculator Logic
function calculate(operator, a, b) {
    switch(operator) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 'Error';
        default: return b;
    }
}

// Event Handling
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        inputNumber(button.dataset.number);
    });
});

document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        handleAction(button.dataset.action);
    });
});`,
            html: `<!-- Calculator Structure -->
<div class="calculator">
    <div class="display">
        <div id="current">0</div>
    </div>
    <div class="buttons-grid">
        <button data-action="clear">C</button>
        <button data-action="backspace">⌫</button>
        <button data-action="divide">÷</button>
        
        <button data-number="7">7</button>
        <button data-number="8">8</button>
        <button data-number="9">9</button>
        <button data-action="multiply">×</button>
        
        <button data-number="4">4</button>
        <button data-number="5">5</button>
        <button data-number="6">6</button>
        <button data-action="subtract">−</button>
        
        <button data-number="1">1</button>
        <button data-number="2">2</button>
        <button data-number="3">3</button>
        <button data-action="add">+</button>
        
        <button data-number="0">0</button>
        <button data-action="decimal">.</button>
        <button data-action="equals">=</button>
    </div>
</div>`,
            css: `.calculator {
    background: #1a1a1a;
    border-radius: 1.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    max-width: 400px;
}

.display {
    background: #000;
    color: white;
    padding: 2rem;
    text-align: right;
    font-size: 2.25rem;
    min-height: 80px;
}

.buttons-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #1a1a1a;
}

.btn-calc {
    aspect-ratio: 1;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-number {
    background: #333;
    color: white;
}

.btn-operator {
    background: #ff9500;
    color: white;
}`
        };
        
        return examples[lang] || examples.js;
    }

    addModalStyles() {
        if (document.getElementById('modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .code-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }

            .code-modal {
                background: white;
                border-radius: 12px;
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                animation: slideInUp 0.3s ease;
            }

            .code-modal-header {
                background: #f8fafc;
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .code-modal-header h3 {
                margin: 0;
                color: #1f2937;
            }

            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.15s ease;
            }

            .close-modal:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .code-tabs {
                display: flex;
                background: #f8fafc;
                border-bottom: 1px solid #e5e7eb;
            }

            .code-tab {
                padding: 0.75rem 1.5rem;
                border: none;
                background: transparent;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.15s ease;
                border-bottom: 2px solid transparent;
            }

            .code-tab.active {
                color: #3b82f6;
                border-bottom-color: #3b82f6;
                background: white;
            }

            .code-display {
                height: 400px;
                overflow: auto;
                background: #1e293b;
            }

            .code-display pre {
                margin: 0;
                padding: 1.5rem;
                color: #e2e8f0;
                font-family: 'Fira Code', 'Consolas', monospace;
                font-size: 0.875rem;
                line-height: 1.6;
            }

            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type]}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
    
    // Smooth scrolling for navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.feature-card, .tech-item, .stat-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    console.log('Calculator Pro - Professional Calculator Application Initialized!');
});

// Add notification animation styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 1.25rem;
        padding: 0;
        margin-left: auto;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.15s ease;
    }

    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(notificationStyles);
