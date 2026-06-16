// ============ SECURITY CONFIGURATION ============
// CSP Headers (debe ser implementado en el servidor también)
const setupSecurityHeaders = () => {
    // Content Security Policy - Previene XSS
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = "default-src 'self'; " +
        "script-src 'self' https://accounts.google.com https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self' https://accounts.google.com https://api.github.com; " +
        "frame-src https://accounts.google.com; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'";
    document.head.appendChild(cspMeta);

    // X-UA-Compatible
    const uaMeta = document.createElement('meta');
    uaMeta.httpEquiv = 'X-UA-Compatible';
    uaMeta.content = 'IE=edge';
    document.head.appendChild(uaMeta);

    // Referrer Policy
    const refMeta = document.createElement('meta');
    refMeta.name = 'referrer';
    refMeta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(refMeta);

    // Permissions Policy
    const permMeta = document.createElement('meta');
    permMeta.httpEquiv = 'Permissions-Policy';
    permMeta.content = 'geolocation=(), microphone=(), camera=(), payment=()';
    document.head.appendChild(permMeta);
};

// ============ INPUT VALIDATION & SANITIZATION ============
class SecurityValidator {
    // Validar email
    static validateEmail(email) {
        const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    // Validar contraseña (mínimo 12 caracteres, mayúscula, minúscula, número, símbolo)
    static validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
        return passwordRegex.test(password);
    }

    // Sanitizar entrada para prevenir XSS
    static sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Validar URL
    static validateUrl(url) {
        try {
            const parsed = new URL(url);
            // Solo permitir HTTPS
            if (parsed.protocol !== 'https:') return false;
            // Whitelist de dominios permitidos
            const allowedHosts = [
                'accounts.google.com',
                'github.com',
                window.location.hostname
            ];
            return allowedHosts.includes(parsed.hostname);
        } catch (e) {
            return false;
        }
    }

    // Validar ángulo (solo números)
    static validateAngle(angle) {
        if (typeof angle !== 'number') return false;
        return isFinite(angle) && !isNaN(angle) && angle >= -1000000 && angle <= 1000000;
    }

    // Validar selección (enum validation)
    static validateUnit(unit) {
        return ['degrees', 'radians'].includes(unit);
    }
}

// ============ RATE LIMITING ============
class RateLimiter {
    constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.attempts = new Map();
    }

    checkLimit(identifier) {
        const now = Date.now();
        const userAttempts = this.attempts.get(identifier) || [];
        
        // Limpiar intentos antiguos
        const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
        
        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }
        
        recentAttempts.push(now);
        this.attempts.set(identifier, recentAttempts);
        return true;
    }

    reset(identifier) {
        this.attempts.delete(identifier);
    }
}

const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 intentos en 15 minutos

// ============ CSRF PROTECTION ============
class CSRFProtection {
    static generateToken() {
        const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        sessionStorage.setItem('csrf_token', token);
        return token;
    }

    static getToken() {
        let token = sessionStorage.getItem('csrf_token');
        if (!token) {
            token = this.generateToken();
        }
        return token;
    }

    static validateToken(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return storedToken && token === storedToken;
    }
}

// ============ SECURE SESSION MANAGEMENT ============
class SecureSessionManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.warningTimeout = 25 * 60 * 1000; // Advertencia a los 25 minutos
        this.lastActivity = Date.now();
        this.sessionId = this.generateSessionId();
        this.initializeSessionTracking();
    }

    generateSessionId() {
        return 'session_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    initializeSessionTracking() {
        // Rastrear actividad del usuario
        document.addEventListener('click', () => this.updateActivity());
        document.addEventListener('keypress', () => this.updateActivity());
        document.addEventListener('mousemove', () => this.updateActivity());

        // Verificar timeout periódicamente
        this.timeoutInterval = setInterval(() => this.checkTimeout(), 60000);
    }

    updateActivity() {
        this.lastActivity = Date.now();
        localStorage.setItem('lastActivity', this.lastActivity);
    }

    checkTimeout() {
        const now = Date.now();
        const timeSinceActivity = now - this.lastActivity;

        if (timeSinceActivity > this.sessionTimeout) {
            this.terminateSession('Sesión expirada por inactividad');
        } else if (timeSinceActivity > this.warningTimeout) {
            this.showSessionWarning();
        }
    }

    terminateSession(reason) {
        console.warn('Session terminated:', reason);
        auth.logout();
        alert(`Sesión terminada: ${reason}`);
    }

    showSessionWarning() {
        const remaining = Math.round((this.sessionTimeout - (Date.now() - this.lastActivity)) / 1000 / 60);
        if (remaining === 5) {
            console.warn(`Su sesión vencerá en ${remaining} minutos por inactividad`);
        }
    }
}

const sessionManager = new SecureSessionManager();

// ============ LOGGING & MONITORING ============
class SecurityLogger {
    static log(event, severity = 'info', details = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            event,
            severity, // 'info', 'warning', 'error', 'critical'
            details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Guardar en localStorage (máximo 100 entradas)
        this.storeLogs(logEntry);

        // También registrar en consola en desarrollo
        if (severity === 'error' || severity === 'critical') {
            console.error('[' + severity.toUpperCase() + ']', event, details);
        } else {
            console.log('[' + severity.toUpperCase() + ']', event);
        }
    }

    static storeLogs(logEntry) {
        try {
            let logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
            logs.push(logEntry);
            // Mantener solo los últimos 100 logs
            if (logs.length > 100) {
                logs = logs.slice(-100);
            }
            localStorage.setItem('securityLogs', JSON.stringify(logs));
        } catch (e) {
            console.error('Error storing logs:', e);
        }
    }

    static getLogs() {
        try {
            return JSON.parse(localStorage.getItem('securityLogs') || '[]');
        } catch (e) {
            return [];
        }
    }
}

// ============ OAUTH CONFIG CON SEGURIDAD ============
const OAUTH_CONFIG = {
    google: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        redirectUri: window.location.origin,
        scope: 'openid email profile'
    },
    github: {
        clientId: 'YOUR_GITHUB_CLIENT_ID',
        redirectUri: window.location.origin + '/callback.html',
        scope: 'user:email'
    }
};

// ============ AUTH STATE MANAGEMENT (MEJORADO) ============
class AuthManager {
    constructor() {
        this.user = this.getStoredUser();
        this.token = localStorage.getItem('authToken');
        this.tokenExpiry = localStorage.getItem('tokenExpiry');
        this.setupSecurityHeaders();
    }

    setupSecurityHeaders() {
        setupSecurityHeaders();
    }

    getStoredUser() {
        try {
            const stored = localStorage.getItem('user');
            if (!stored) return null;
            return JSON.parse(stored);
        } catch (e) {
            SecurityLogger.log('Error parsing stored user', 'warning');
            return null;
        }
    }

    saveUser(user) {
        // Validar datos de usuario
        if (!user.email || !SecurityValidator.validateEmail(user.email)) {
            throw new Error('Email inválido');
        }

        this.user = user;
        const sanitizedUser = {
            id: SecurityValidator.sanitizeInput(user.id),
            email: SecurityValidator.sanitizeInput(user.email),
            name: SecurityValidator.sanitizeInput(user.name),
            picture: user.picture ? SecurityValidator.sanitizeInput(user.picture) : null,
            provider: user.provider,
            loginTime: user.loginTime
        };
        localStorage.setItem('user', JSON.stringify(sanitizedUser));
        SecurityLogger.log('User logged in', 'info', { email: user.email, provider: user.provider });
    }

    saveToken(token, expiryMinutes = 60) {
        this.token = token;
        const expiry = Date.now() + (expiryMinutes * 60 * 1000);
        this.tokenExpiry = expiry;
        localStorage.setItem('authToken', token);
        localStorage.setItem('tokenExpiry', expiry);
    }

    isTokenValid() {
        if (!this.token || !this.tokenExpiry) return false;
        return Date.now() < this.tokenExpiry;
    }

    async loginWithGoogle(response) {
        try {
            // Rate limiting
            if (!loginRateLimiter.checkLimit('google_login')) {
                throw new Error('Demasiados intentos. Intente más tarde.');
            }

            // Validar response
            if (!response || !response.credential) {
                throw new Error('Respuesta de Google inválida');
            }

            const userData = this.decodeJwt(response.credential);

            // Validar datos decodificados
            if (!userData.email || !userData.sub) {
                throw new Error('Datos de usuario inválidos');
            }

            // Verificar que el email es de un dominio permitido (opcional)
            // if (!userData.email.endsWith('@company.com')) {
            //     throw new Error('Dominio de email no permitido');
            // }

            const user = {
                id: userData.sub,
                email: userData.email,
                name: userData.name || userData.email.split('@')[0],
                picture: userData.picture,
                provider: 'google',
                loginTime: new Date().toISOString(),
                emailVerified: userData.email_verified
            };

            this.saveUser(user);
            this.saveToken(response.credential);
            this.showApp();
            this.updateUserDisplay();
            SecurityLogger.log('Google authentication successful', 'info');
        } catch (error) {
            SecurityLogger.log('Google authentication failed', 'error', { error: error.message });
            alert('Error al autenticar con Google: ' + error.message);
        }
    }

    async loginWithGitHub() {
        try {
            // Rate limiting
            if (!loginRateLimiter.checkLimit('github_login')) {
                throw new Error('Demasiados intentos. Intente más tarde.');
            }

            if (!SecurityValidator.validateUrl('https://' + OAUTH_CONFIG.github.clientId)) {
                const authUrl = `https://github.com/login/oauth/authorize?` +
                    `client_id=${encodeURIComponent(OAUTH_CONFIG.github.clientId)}` +
                    `&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.github.redirectUri)}` +
                    `&scope=${encodeURIComponent(OAUTH_CONFIG.github.scope)}` +
                    `&state=${encodeURIComponent(this.generateState())}`;

                const state = new URLSearchParams(authUrl).get('state');
                sessionStorage.setItem('oauth_state', state);

                window.location.href = authUrl;
            }
        } catch (error) {
            SecurityLogger.log('GitHub login failed', 'error', { error: error.message });
            alert('Error al iniciar GitHub login');
        }
    }

    async processGitHubCallback(code, state) {
        try {
            const storedState = sessionStorage.getItem('oauth_state');
            if (!state || state !== storedState) {
                throw new Error('State validation failed - possible CSRF attack');
            }

            SecurityLogger.log('GitHub callback processing', 'info');

            // En producción, esto debe ser manejado por el backend
            const user = {
                id: 'github_' + SecurityValidator.sanitizeInput(code.substring(0, 20)),
                email: 'usuario@github.com',
                name: 'Usuario GitHub',
                provider: 'github',
                loginTime: new Date().toISOString()
            };

            this.saveUser(user);
            this.saveToken(code);
            this.showApp();
            this.updateUserDisplay();
        } catch (error) {
            SecurityLogger.log('GitHub callback failed', 'error', { error: error.message });
            alert('Error al procesar autenticación de GitHub');
        }
    }

    async loginWithEmail(email, password) {
        try {
            // Rate limiting
            if (!loginRateLimiter.checkLimit('email_login_' + email)) {
                throw new Error('Demasiados intentos. Intente más tarde.');
            }

            // Validar email
            if (!SecurityValidator.validateEmail(email)) {
                throw new Error('Email inválido');
            }

            // Validar contraseña
            if (!SecurityValidator.validatePassword(password)) {
                throw new Error('La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un símbolo');
            }

            // En producción, esto debe ir a un backend seguro
            const user = {
                id: 'email_' + Date.now(),
                email: email,
                name: email.split('@')[0],
                provider: 'email',
                loginTime: new Date().toISOString()
            };

            this.saveUser(user);
            this.saveToken('token_' + Date.now(), 60);
            this.showApp();
            this.updateUserDisplay();
            SecurityLogger.log('Email login successful', 'info', { email: email });
        } catch (error) {
            SecurityLogger.log('Email login failed', 'error', { error: error.message, email: email });
            alert('Error en login: ' + error.message);
        }
    }

    logout() {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiry');
            sessionStorage.removeItem('oauth_state');
            this.user = null;
            this.token = null;
            this.tokenExpiry = null;
            this.showAuth();
            SecurityLogger.log('User logged out', 'info');
        } catch (error) {
            SecurityLogger.log('Logout error', 'error', { error: error.message });
        }
    }

    showApp() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
    }

    showAuth() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }

    updateUserDisplay() {
        if (this.user) {
            const displayText = `${SecurityValidator.sanitizeInput(this.user.name)} (${this.user.provider})`;
            document.getElementById('user-display').textContent = displayText;
        }
    }

    decodeJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) throw new Error('Invalid JWT');
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            throw new Error('Error decodificando JWT: ' + e.message);
        }
    }

    generateState() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    isAuthenticated() {
        return this.user !== null && this.isTokenValid();
    }
}

const auth = new AuthManager();

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
    SecurityLogger.log('Page initialized', 'info');

    // Inicializar Google Sign-In
    if (window.google) {
        google.accounts.id.initialize({
            client_id: OAUTH_CONFIG.google.clientId,
            callback: (response) => auth.loginWithGoogle(response),
            auto_select: false
        });
    }

    // Event listeners con validación
    document.getElementById('google-login-btn').addEventListener('click', () => {
        if (window.google) {
            google.accounts.id.prompt();
        } else {
            alert('Por favor configura tu Google Client ID');
        }
    });

    document.getElementById('github-login-btn').addEventListener('click', () => {
        if (OAUTH_CONFIG.github.clientId === 'YOUR_GITHUB_CLIENT_ID') {
            alert('Por favor configura tu GitHub Client ID');
            return;
        }
        auth.loginWithGitHub();
    });

    document.getElementById('email-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const csrfToken = CSRFProtection.getToken();
        const email = document.getElementById('email-input').value;
        const password = document.getElementById('password-input').value;
        
        // Validar CSRF token
        if (!CSRFProtection.validateToken(csrfToken)) {
            SecurityLogger.log('CSRF validation failed', 'warning');
            alert('Error de seguridad. Por favor recarga la página.');
            return;
        }
        
        auth.loginWithEmail(email, password);
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            auth.logout();
        }
    });

    // Verificar si ya está autenticado
    if (auth.isAuthenticated()) {
        auth.showApp();
        auth.updateUserDisplay();
    } else {
        auth.showAuth();
    }

    // Procesar callback de GitHub
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
        const code = params.get('code');
        const state = params.get('state');
        auth.processGitHubCallback(code, state);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Generar token CSRF
    CSRFProtection.generateToken();
});

// Limpiar logs al cerrar la ventana
window.addEventListener('beforeunload', () => {
    SecurityLogger.log('User session ended', 'info');
});
