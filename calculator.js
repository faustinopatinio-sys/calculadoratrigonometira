// ============ CALCULATOR LOGIC ============
class TrigonometricCalculator {
    constructor() {
        this.lastAngle = null;
        this.lastUnit = 'degrees';
    }

    // Convertir grados a radianes
    toRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    // Obtener el ángulo en radianes
    getRadians(angle, unit) {
        if (unit === 'radians') {
            return angle;
        }
        return this.toRadians(angle);
    }

    // Calcular todas las funciones trigonométricas
    calculate(angle, unit) {
        try {
            const radians = this.getRadians(angle, unit);
            this.lastAngle = angle;
            this.lastUnit = unit;

            return {
                sin: Math.sin(radians),
                cos: Math.cos(radians),
                tan: Math.tan(radians),
                cot: 1 / Math.tan(radians),
                sec: 1 / Math.cos(radians),
                csc: 1 / Math.sin(radians)
            };
        } catch (error) {
            console.error('Error en cálculo:', error);
            return null;
        }
    }

    // Formatear número con precisión
    formatNumber(num, decimals = 6) {
        if (!isFinite(num)) {
            return 'Indefinido';
        }
        return parseFloat(num.toFixed(decimals));
    }

    // Validar ángulo
    validateAngle(angle) {
        return !isNaN(angle) && isFinite(angle);
    }
}

// ============ UI MANAGER ============
class CalculatorUI {
    constructor(calculator) {
        this.calculator = calculator;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.handleCalculation();
        });

        // Permitir Enter en el input
        document.getElementById('angle-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleCalculation();
            }
        });

        // Actualizar al cambiar unidad
        document.getElementById('unit-select').addEventListener('change', () => {
            if (this.calculator.lastAngle !== null) {
                this.handleCalculation();
            }
        });
    }

    handleCalculation() {
        const angleInput = document.getElementById('angle-input').value;
        const unit = document.getElementById('unit-select').value;

        if (!angleInput) {
            alert('Por favor ingresa un ángulo');
            return;
        }

        const angle = parseFloat(angleInput);

        if (!this.calculator.validateAngle(angle)) {
            alert('Por favor ingresa un ángulo válido');
            return;
        }

        this.performCalculation(angle, unit);
    }

    performCalculation(angle, unit) {
        const results = this.calculator.calculate(angle, unit);

        if (!results) {
            alert('Error al calcular');
            return;
        }

        this.displayResults(results);
    }

    displayResults(results) {
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
    }

    addResultAnimation() {
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach((card, index) => {
            card.style.animation = 'none';
            // Trigger reflow para reiniciar animación
            void card.offsetWidth;
            card.style.animation = `slideUp 0.4s ease-out ${index * 0.05}s`;
        });
    }
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new TrigonometricCalculator();
    const ui = new CalculatorUI(calculator);

    // Ejemplos predefinidos (opcional)
    setupExamples();
});

// ============ EJEMPLOS (OPCIONAL) ============
function setupExamples() {
    // Puedes agregar ejemplos rápidos aquí
    const examples = [
        { angle: 0, unit: 'degrees' },
        { angle: 45, unit: 'degrees' },
        { angle: 90, unit: 'degrees' }
    ];

    // Ejemplo: cargar primer ángulo
    document.getElementById('angle-input').value = '0';
}

// ============ ANIMACIÓN CSS ============
// Agregar keyframe para animación si no existe
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