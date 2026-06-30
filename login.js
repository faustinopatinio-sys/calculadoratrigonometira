// Obtener el formulario y los campos
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const successMessage = document.getElementById('successMessage');

// Obtener los elementos de error
const usernameError = document.getElementById('usernameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

// Validar nombre de usuario
function validateUsername(username) {
    if (username.length < 3) {
        return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos';
    }
    return '';
}

// Validar email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Por favor, ingresa un correo electrónico válido';
    }
    return '';
}

// Validar contraseña
function validatePassword(password) {
    if (password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
        return 'La contraseña debe contener al menos un número';
    }
    return '';
}

// Validar que las contraseñas coincidan
function validatePasswordMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
        return 'Las contraseñas no coinciden';
    }
    return '';
}

// Limpiar mensajes de error
function clearErrors() {
    usernameError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    confirmPasswordError.textContent = '';
}

// Validar en tiempo real
usernameInput.addEventListener('blur', () => {
    usernameError.textContent = validateUsername(usernameInput.value);
});

emailInput.addEventListener('blur', () => {
    emailError.textContent = validateEmail(emailInput.value);
});

passwordInput.addEventListener('blur', () => {
    passwordError.textContent = validatePassword(passwordInput.value);
});

confirmPasswordInput.addEventListener('blur', () => {
    const passwordMatchError = validatePasswordMatch(
        passwordInput.value,
        confirmPasswordInput.value
    );
    confirmPasswordError.textContent = passwordMatchError;
});

// Manejar el envío del formulario
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Limpiar errores previos
    clearErrors();

    // Validar todos los campos
    const usernameErrorMsg = validateUsername(usernameInput.value);
    const emailErrorMsg = validateEmail(emailInput.value);
    const passwordErrorMsg = validatePassword(passwordInput.value);
    const passwordMatchErrorMsg = validatePasswordMatch(
        passwordInput.value,
        confirmPasswordInput.value
    );

    // Mostrar errores
    if (usernameErrorMsg) usernameError.textContent = usernameErrorMsg;
    if (emailErrorMsg) emailError.textContent = emailErrorMsg;
    if (passwordErrorMsg) passwordError.textContent = passwordErrorMsg;
    if (passwordMatchErrorMsg) confirmPasswordError.textContent = passwordMatchErrorMsg;

    // Si no hay errores, procesar el login
    if (!usernameErrorMsg && !emailErrorMsg && !passwordErrorMsg && !passwordMatchErrorMsg) {
        // Crear objeto con los datos del usuario
        const userData = {
            username: usernameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            timestamp: new Date().toLocaleString('es-ES')
        };

        // Guardar en localStorage
        localStorage.setItem('userData', JSON.stringify(userData));

        // Mostrar mensaje de éxito
        showSuccessMessage();

        // Limpiar el formulario
        loginForm.reset();

        // Redirigir después de 2 segundos
        setTimeout(() => {
            console.log('Usuario registrado:', userData);
            // Aquí puedes redirigir a otra página
            // window.location.href = 'dashboard.html';
        }, 2000);
    }
});

// Mostrar mensaje de éxito
function showSuccessMessage() {
    successMessage.textContent = '✓ ¡Inicio de sesión exitoso! Redirigiendo...';
    successMessage.classList.add('show');

    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

// Función para obtener datos del usuario guardados
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('userData');
    console.log('Sesión cerrada');
}

// Verificar si hay usuario logueado al cargar la página
window.addEventListener('load', () => {
    const user = getUserData();
    if (user) {
        console.log('Usuario actual:', user);
    }
});
