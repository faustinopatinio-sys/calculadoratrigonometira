// ============ SECURE CALCULATOR LOGIC ============
class TrigonometricCalculator {
    constructor() {
        this.lastAngle = null;
        this.lastUnit = 'degrees';
        this.calculationHistory = [];
        this.maxHistorySize = 100;
    }

    // Validar entrada antes de calcular
    validateInput(angle, unit) {
        // Validar tipo de datos
        if (typeof angle !== 'number' || typeof unit !== 'string') {
            throw new Error('Tipos de datos inválidos');
        }

        // Validar rango
        if (!isFinite(angle) || isNaN(angle)) {
            throw new Error('Ángulo inválido');
        }

        // Limitar rango para evitar overflow
        const MAX_ANGLE = 1000000;
        if (Math.abs(angle) > MAX_ANGLE) {
            throw new Error(`Ángulo debe estar entre -${MAX_ANGLE} y ${MAX_ANGLE}`);
        }

        // Validar unit
        if (!['degrees', 'radians'].includes(unit)) {
            throw new Error('Unidad inválida');
        }

        return true;
    }

    toRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    getRadians(angle, unit) {
        if (unit === 'radians') {
            return angle;
        }
        return this.toRadians(angle);
    }

    calculate(angle, unit) {
        try {
            // Validar entrada
            this.validateInput(angle, unit);

            const radians = this.getRadians(angle, unit);
            this.lastAngle = angle;
            this.lastUnit = unit;

            const results = {
                sin: Math.sin(radians),
                cos: Math.cos(radians),
                tan: Math.tan(radians),
                cot: 1 / Math.tan(radians),
                sec: 1 / Math.cos(radians),
                csc: 1 / Math.sin(radians)
            };

            // Registrar en historial
            this.addToHistory(angle, unit, results);

            return results;
        } catch (error) {
            SecurityLogger.log('Calculation error', 'warning', { error: error.message });
            throw error;
        }
    }

    addToHistory(angle, unit, results) {
        try {
            this.calculationHistory.push({
                angle,
                unit,
                results,
                timestamp: new Date().toISOString()
            });

            // Limitar historial
            if (this.calculationHistory.length > this.maxHistorySize) {
                this.calculationHistory = this.calculationHistory.slice(-this.maxHistorySize);
            }
        } catch (e) {
            console.error('Error adding to history:', e);
        }
    }

    formatNumber(num, decimals = 6) {
        if (!isFinite(num)) {
            return 'Indefinido';
        }
        // Redondear a evitar precision issues
        const rounded = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
        return rounded.toString();
    }

    getHistory() {
        return this.calculationHistory;
    }
}

// ============ SECURE UI MANAGER ============
class CalculatorUI {
    constructor(calculator) {
        this.calculator = calculator;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('calculate-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleCalculation();
        });

        document.getElementById('angle-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleCalculation();
            }
        });

        document.getElementById('unit-select').addEventListener('change', () => {
            if (this.calculator.lastAngle !== null) {
                this.handleCalculation();
            }
        });
    }

    handleCalculation() {
        try {
            const angleInput = document.getElementById('angle-input').value;
            const unit = document.getElementById('unit-select').value;

            if (!angleInput) {
                alert('Por favor ingresa un ángulo');
                return;
            }

            const angle = parseFloat(angleInput);

            if (isNaN(angle)) {
                alert('Por favor ingresa un ángulo válido');
                return;
            }

            this.performCalculation(angle, unit);
        } catch (error) {
            SecurityLogger.log('UI calculation error', 'error', { error: error.message });
            alert('Error: ' + error.message);
        }
    }

    performCalculation(angle, unit) {
        try {
            const results = this.calculator.calculate(angle, unit);
            this.displayResults(results);
            SecurityLogger.log('Calculation performed', 'info', { angle, unit });
        } catch (error) {
            alert('Error al calcular: ' + error.message);
        }
    }

    displayResults(results) {
        try {
            document.getElementById('result-sin').textContent = 
                this.calculator.formatNumber(results.sin);
            document.getElementById('result-cos').textContent = 
                this.calculator.formatNumber(results.cos);
            document.getElementById('result-tan').textContent = 
                this.calculator.formatNumber(results.tan);
            document.getElementById('result-cot').textContent = 
                this.calculator.formatNumber(results.cot);
            document.getElementById('result-sec').textContent = 
                this.calculator.formatNumber(results.sec);
            document.getElementById('result-csc').textContent = 
                this.calculator.formatNumber(results.csc);

            this.addResultAnimation();
        } catch (error) {
            console.error('Error displaying results:', error);
        }
    }

    addResultAnimation() {
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach((card, index) => {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = `slideUp 0.4s ease-out ${index * 0.05}s`;
        });
    }
}

// ============ INICIALIZACIÓN ============
let calculator = null;
let ui = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        calculator = new TrigonometricCalculator();
        ui = new CalculatorUI(calculator);
        document.getElementById('angle-input').value = '0';
        SecurityLogger.log('Calculator initialized', 'info');
    } catch (error) {
        SecurityLogger.log('Calculator initialization failed', 'error', { error: error.message });
        alert('Error al inicializar la calculadora');
    }
});

// ============ ANIMACIÓN CSS ============
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
