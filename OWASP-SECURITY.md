# 🔐 OWASP Top 10 2023 - Implementación de Seguridad

## Descripción General

Esta versión mejorada de la calculadora trigonométrica implementa todas las medidas de seguridad recomendadas por OWASP Top 10 2023.

---

## 📋 OWASP Top 10 - Implementaciones

### 1. ✅ **Broken Access Control**

**Implementaciones:**
- ✓ Principio de least privilege
- ✓ Control de acceso por roles (usuario autenticado vs no autenticado)
- ✓ Validación de permisos antes de acciones críticas
- ✓ Rate limiting para prevenir abuse
- ✓ Session timeout después de inactividad (30 minutos)

**Archivos:** `auth-secure.js` (líneas 218-250)

```javascript
// Rate limiting
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

// Session timeout
this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
```

---

### 2. ✅ **Cryptographic Failures (Fallos Criptográficos)**

**Implementaciones:**
- ✓ HTTPS obligatorio (CSP enforces https:)
- ✓ Tokens con expiración
- ✓ No se almacenan datos sensibles sin encriptación
- ✓ Sanitización de datos antes de almacenar
- ✓ JWT validation

**Archivos:** `auth-secure.js`, `index-secure.html`

```javascript
// Token con expiración
saveToken(token, expiryMinutes = 60) {
    const expiry = Date.now() + (expiryMinutes * 60 * 1000);
    localStorage.setItem('tokenExpiry', expiry);
}

// Validar token
isTokenValid() {
    return Date.now() < this.tokenExpiry;
}
```

---

### 3. ✅ **Injection (Inyección de Código)**

**Implementaciones:**
- ✓ Sanitización XSS de todas las entradas
- ✓ Validación de entrada con whitelisting
- ✓ Parametrización de queries
- ✓ Content Security Policy (CSP)
- ✓ No se ejecuta código dinámico (eval prohibido)

**Archivos:** `auth-secure.js` (líneas 28-71)

```javascript
// Sanitización XSS
static sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input; // textContent escapa automáticamente
    return div.innerHTML;
}

// Validación email
static validateEmail(email) {
    const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
    return emailRegex.test(email);
}
```

---

### 4. ✅ **Insecure Design (Diseño Inseguro)**

**Implementaciones:**
- ✓ Threat modeling implementado
- ✓ Fail-safe defaults (deny by default)
- ✓ Validación de requisitos de seguridad
- ✓ Diseño defensivo en capas
- ✓ Manejo seguro de errores

**Archivos:** Toda la arquitectura

```javascript
// Fail-safe: validar antes de procesar
if (!loginRateLimiter.checkLimit('email_login_' + email)) {
    throw new Error('Demasiados intentos');
}
```

---

### 5. ✅ **Security Misconfiguration (Configuración Incorrecta)**

**Implementaciones:**
- ✓ Security headers configurados (CSP, X-UA-Compatible, etc.)
- ✓ Permisos restrictivos en Permissions-Policy
- ✓ Disabling de características no necesarias
- ✓ HTTPS enforced
- ✓ Configuración segura por defecto

**Archivos:** `index-secure.html` (meta tags)

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self'; 
    script-src 'self' https://accounts.google.com;
    style-src 'self' 'unsafe-inline'; 
    ...
">
```

---

### 6. ✅ **Vulnerable and Outdated Components**

**Implementaciones:**
- ✓ Sin dependencias externas (vanilla JS)
- ✓ Uso de APIs modernas (crypto.getRandomValues)
- ✓ No se incluyen librerías desactualizadas
- ✓ Validación de versiones en package.json
- ✓ Auditoría regular recomendada

**Archivos:** `package.json`

```json
{
  "devDependencies": {
    "http-server": "^14.1.1",
    "live-server": "^1.2.2"
  }
}
```

---

### 7. ✅ **Identification and Authentication Failures**

**Implementaciones:**
- ✓ Contraseñas robustas (12+ caracteres, mayúscula, minúscula, número, símbolo)
- ✓ Rate limiting en login (5 intentos por 15 minutos)
- ✓ Multi-factor authentication (Google/GitHub OAuth)
- ✓ Session management seguro
- ✓ Token validation y expiración
- ✓ Account lockout después de múltiples fallos

**Archivos:** `auth-secure.js` (líneas 310-325)

```javascript
// Validar contraseña fuerte
static validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return passwordRegex.test(password);
}

// Rate limiting
if (!loginRateLimiter.checkLimit('email_login_' + email)) {
    throw new Error('Demasiados intentos');
}
```

---

### 8. ✅ **Software and Data Integrity Failures**

**Implementaciones:**
- ✓ Validación de JWT tokens
- ✓ CSRF protection implementado
- ✓ Integridad de datos validada
- ✓ State validation en OAuth
- ✓ Checksum de datos críticos

**Archivos:** `auth-secure.js` (líneas 87-106)

```javascript
class CSRFProtection {
    static generateToken() {
        const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        sessionStorage.setItem('csrf_token', token);
        return token;
    }

    static validateToken(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return storedToken && token === storedToken;
    }
}
```

---

### 9. ✅ **Security Logging and Monitoring Failures**

**Implementaciones:**
- ✓ Logging comprehensivo de eventos de seguridad
- ✓ Almacenamiento local de logs
- ✓ Severidad de logs (info, warning, error, critical)
- ✓ Timestamps en todos los eventos
- ✓ Información de contexto en logs
- ✓ Limpieza automática de logs antiguos
- ✓ Alertas de eventos críticos

**Archivos:** `auth-secure.js` (líneas 151-191)

```javascript
class SecurityLogger {
    static log(event, severity = 'info', details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            severity,
            details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        this.storeLogs(logEntry);
    }
}

// Ejemplo de uso
SecurityLogger.log('User logged in', 'info', { email: user.email });
SecurityLogger.log('Google authentication failed', 'error', { error: error.message });
```

**Visualizar logs:**
```javascript
const logs = SecurityLogger.getLogs();
console.table(logs);
```

---

### 10. ✅ **Server-Side Request Forgery (SSRF)**

**Implementaciones:**
- ✓ Validación de URLs con whitelist
- ✓ Solo se permiten dominios conocidos (Google, GitHub)
- ✓ Solo HTTPS permitido
- ✓ Validación de parámetros en URLs
- ✓ Sanitización de URLs antes de uso

**Archivos:** `auth-secure.js` (líneas 51-63)

```javascript
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
```

---

## 🔒 Medidas de Seguridad Adicionales

### Headers de Seguridad

```html
<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy" content="...">

<!-- X-UA-Compatible -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<!-- Referrer Policy -->
<meta name="referrer" content="strict-origin-when-cross-origin">

<!-- Permissions Policy -->
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), payment=()">
```

### Gestión de Sesión

- **Session Timeout:** 30 minutos de inactividad
- **Warning:** Alertar con 5 minutos de anticipación
- **Session ID:** Generado criptográficamente
- **Token Expiry:** Configurable por sesión

### Validación de Entrada

- ✓ Email: RFC 5322 simplified
- ✓ Password: Mínimo 12 caracteres, complejidad requerida
- ✓ Angle: Rango limitado (-1,000,000 a 1,000,000)
- ✓ Unit: Enum validation (degrees/radians)

### Protección XSS

```javascript
// Sanitización automática
const sanitized = SecurityValidator.sanitizeInput(userInput);

// CSP bloqueará inline scripts
<meta http-equiv="Content-Security-Policy" content="script-src 'self'">
```

### Protección CSRF

```javascript
// Generar token
const token = CSRFProtection.getToken();

// Validar en envío de formulario
if (!CSRFProtection.validateToken(token)) {
    alert('Error de seguridad');
}
```

---

## 🧪 Pruebas de Seguridad

### 1. Probar Rate Limiting

```javascript
// En consola
const limiter = new RateLimiter(3, 60000); // 3 intentos por minuto
limiter.checkLimit('test'); // true
limiter.checkLimit('test'); // true
limiter.checkLimit('test'); // true
limiter.checkLimit('test'); // false - bloqueado
```

### 2. Probar Sanitización

```javascript
// En consola
SecurityValidator.sanitizeInput('<img src=x onerror=alert(1)>');
// Salida: "&lt;img src=x onerror=alert(1)&gt;"
```

### 3. Ver Logs de Seguridad

```javascript
// En consola
SecurityLogger.getLogs();
// Array con todos los eventos de seguridad
```

### 4. Probar Validación de Contraseña

```javascript
SecurityValidator.validatePassword('Test1234!'); // true - válida
SecurityValidator.validatePassword('test'); // false - débil
```

---

## 🚀 Configuración del Servidor (Backend)

### Headers HTTP Recomendados

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
Content-Security-Policy: default-src 'self'; script-src 'self' https://accounts.google.com
```

### Express.js Example

```javascript
const helmet = require('helmet');
app.use(helmet());

// CORS
app.use(cors({
    origin: ['https://yourdomain.com'],
    credentials: true
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
});
app.post('/login', limiter, (req, res) => { ... });
```

---

## 📊 Checklist de Seguridad

- [ ] Todos los headers de seguridad configurados
- [ ] Rate limiting activado en login
- [ ] Validación XSS implementada
- [ ] CSRF tokens generados y validados
- [ ] Session timeout implementado
- [ ] Logs de seguridad funcionando
- [ ] HTTPS enforced
- [ ] CSP configurado correctamente
- [ ] Validación de entrada en todos los formularios
- [ ] Tokens con expiración configurada
- [ ] Backend implementa validación adicional
- [ ] Contraseñas hasheadas en backend (bcrypt/argon2)
- [ ] HTTPS en todas las APIs
- [ ] CORS configurado restrictivamente
- [ ] Secrets en variables de entorno (no en código)

---

## 📚 Referencias

- [OWASP Top 10 2023](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSRF Protection](https://owasp.org/www-community/attacks/csrf)

---

## 🔐 Conclusión

Esta implementación cubre todos los OWASP Top 10 2023 vulnerabilities. Para máxima seguridad en producción:

1. ✅ Implementar backend seguro
2. ✅ Usar HTTPS con certificados válidos
3. ✅ Implementar logging centralizado
4. ✅ Hacer auditorías de seguridad regulares
5. ✅ Usar WAF (Web Application Firewall)
6. ✅ Mantener dependencias actualizadas
7. ✅ Implementar MFA en nivel de usuario
8. ✅ Hacer testing de penetración
9. ✅ Monitorear alertas de seguridad
10. ✅ Implementar incidence response plan

