

// Calculator functionality
const montoInput = document.getElementById('monto');
const plazoInput = document.getElementById('plazo');
const plazoValue = document.getElementById('plazo-value');
const tipoPrestamoSelect = document.getElementById('tipo-prestamo');
const tasaInteresText = document.getElementById('tasa');
const cuotaElement = document.getElementById('cuota');

if (montoInput && plazoInput && plazoValue && tipoPrestamoSelect && tasaInteresText && cuotaElement) {
    // Actualizar la tasa de interés según el tipo de préstamo
    function actualizarTasa() {
        const tipoPrestamo = tipoPrestamoSelect.value;
        let tasaAnual = 0.12; // Por defecto hipotecario 12%
        if (tipoPrestamo === 'colaboradores') {
            tasaAnual = 0.24; // Colaboradores 24%
        }
        tasaInteresText.value = `${(tasaAnual * 100).toFixed(0)}%`;
        calculateMonthlyPayment();
    }

    // Calcular pago mensual
    function calculateMonthlyPayment() {
        const principal = parseFloat(montoInput.value);
        const months = parseInt(plazoInput.value);
        const tipoPrestamo = tipoPrestamoSelect.value;
        let annualRate = 0.12; // Hipotecario por defecto
        if (tipoPrestamo === 'colaboradores') {
            annualRate = 0.24; // Colaboradores
        }
        const monthlyRate = annualRate / 12;
        // Calcular pago mensual: P * r * (1+r)^n / ((1+r)^n - 1)
        const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        cuotaElement.textContent = `$${monthlyPayment.toFixed(2)} USD`;
    }

    // Validar monto mínimo y máximo
    function validarMonto() {
        let valor = parseFloat(montoInput.value);
        if (valor < 1000) montoInput.value = 1000;
        if (valor > 100000) montoInput.value = 100000;
        calculateMonthlyPayment();
    }

    // Event listeners
    montoInput.addEventListener('input', calculateMonthlyPayment);
    montoInput.addEventListener('change', validarMonto);
    plazoInput.addEventListener('input', function() {
        plazoValue.textContent = `${this.value} meses`;
        calculateMonthlyPayment();
    });
    tipoPrestamoSelect.addEventListener('change', actualizarTasa);

    // Inicializar cálculo
    actualizarTasa();
    calculateMonthlyPayment();
}