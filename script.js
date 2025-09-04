// Calculator functionality
const montoInput = document.getElementById('monto');
const plazoInput = document.getElementById('plazo');
const plazoValue = document.getElementById('plazo-value');
const cuotaElement = document.getElementById('cuota');

function calculateMonthlyPayment() {
    const principal = parseFloat(montoInput.value);
    const months = parseInt(plazoInput.value);
    const annualRate = 0.12; // 12%
    const monthlyRate = annualRate / 12;
    
    // Calculate monthly payment using formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    
    cuotaElement.textContent = `$${monthlyPayment.toFixed(2)} USD`;
}

montoInput.addEventListener('input', calculateMonthlyPayment);

plazoInput.addEventListener('input', function() {
    plazoValue.textContent = `${this.value} meses`;
    calculateMonthlyPayment();
});

// Initial calculation
calculateMonthlyPayment();

// Tab functionality for requirements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Form submission
document.getElementById('infoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.');
    this.reset();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});