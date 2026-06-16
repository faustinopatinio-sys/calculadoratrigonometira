// ============ CONFIGURATION ============
// Reemplaza estos valores con tus credenciales de OAuth
const OAUTH_CONFIG = {
    google: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        redirectUri: window.location.origin
    },
    github: {
        clientId: 'YOUR_GITHUB_CLIENT_ID',
        redirectUri: window.location.origin + '/callback.html',
        scope: 'user:email'
    }
};

// ============ AUTH STATE MANAGEMENT ============
class AuthManager {
    constructor() {
        this.user = this.getStoredUser();
        this.token = localStorage.getItem('authToken');
    }

    // Obtener usuario almacenado
    getStoredUser() {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    }

    // Guardar usuario
    saveUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Guardar token
    saveToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Login con Google
    async loginWithGoogle(response) {
        try {
            // Decodificar el JWT
            const userData = this.decodeJwt(response.credential);
            
            const user = {
                id: userData.sub,
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
                provider: 'google',
                loginTime: new Date().toISOString()
            };

            this.saveUser(user);
            this.saveToken(response.credential);
            this.showApp();
            this.updateUserDisplay();

            console.log('✓ Autenticado con Google:', user.email);
        } catch (error) {
            console.error('Error en Google login:', error);
            alert('Error al autenticar con Google');
        }
    }

    // Login con GitHub
    async loginWithGitHub() {
        const authUrl = `https://github.com/login/oauth/authorize?` +
            `client_id=${OAUTH_CONFIG.github.clientId}` +
            `&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.github.redirectUri)}` +
            `&scope=${encodeURIComponent(OAUTH_CONFIG.github.scope)}` +
            `&state=${this.generateState()}`;
        
        // Guardar state en sessionStorage para validación
        const state = new URLSearchParams(authUrl).get('state');
        sessionStorage.setItem('oauth_state', state);
        
        window.location.href = authUrl;
    }

    // Procesar callback de GitHub
    async processGitHubCallback(code, state) {
        try {
            // Validar state
            const storedState = sessionStorage.getItem('oauth_state');
            if (state !== storedState) {
                throw new Error('State inválido');
            }

            // Aquí normalmente harías una llamada a tu backend
            // para intercambiar el código por un token
            // Por ahora, simulamos un usuario
            const user = {
                id: 'github_' + code,
                email: 'usuario@github.com',
                name: 'Usuario GitHub',
                provider: 'github',
                loginTime: new Date().toISOString()
            };

            this.saveUser(user);
            this.saveToken(code);
            this.showApp();
            this.updateUserDisplay();

            console.log('✓ Autenticado con GitHub');
        } catch (error) {
            console.error('Error en GitHub callback:', error);
            alert('Error al procesar la autenticación de GitHub');
        }
    }

    // Login con email/contraseña
    async loginWithEmail(email, password) {
        // Aquí conectarías con tu backend
        // Por ahora, simulamos un login
        if (!email || !password) {
            alert('Por favor completa todos los campos');
            return;
        }

        const user = {
            id: 'email_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            provider: 'email',
            loginTime: new Date().toISOString()
        };

        this.saveUser(user);
        this.saveToken('token_' + Date.now());
        this.showApp();
        this.updateUserDisplay();

        console.log('✓ Autenticado con email:', email);
    }

    // Logout
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('oauth_state');
        this.user = null;
        this.token = null;
        this.showAuth();
        console.log('✓ Sesión cerrada');
    }

    // Mostrar la aplicación
    showApp() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
    }

    // Mostrar auth
    showAuth() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }

    // Actualizar display de usuario
    updateUserDisplay() {
        if (this.user) {
            const displayText = `${this.user.name} (${this.user.provider})`;
            document.getElementById('user-display').textContent = displayText;
        }
    }

    // Decodificar JWT
    decodeJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );
        return JSON.parse(jsonPayload);
    }

    // Generar state para OAuth
    generateState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return this.user !== null && this.token !== null;
    }
}

// ============ INITIALIZATION ============
const auth = new AuthManager();

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Google Sign-In
    if (window.google) {
        google.accounts.id.initialize({
            client_id: OAUTH_CONFIG.google.clientId,
            callback: (response) => auth.loginWithGoogle(response),
            auto_select: false
        });
    }

    // Event listeners
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
        const email = document.getElementById('email-input').value;
        const password = document.getElementById('password-input').value;
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

    // Procesar callback de GitHub si es necesario
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
        const code = params.get('code');
        const state = params.get('state');
        auth.processGitHubCallback(code, state);
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});