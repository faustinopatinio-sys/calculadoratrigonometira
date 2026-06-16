# 🔐 Configuración de Social Login - Calculadora Trigonométrica

## Descripción General

Esta calculadora trigonométrica incluye autenticación con **Google**, **GitHub** y **Email**. Sigue los pasos a continuación para configurar los proveedores OAuth.

---

## 📋 Índice

1. [Configuración de Google OAuth](#configuración-de-google-oauth)
2. [Configuración de GitHub OAuth](#configuración-de-github-oauth)
3. [Instalación Local](#instalación-local)
4. [Pruebas](#pruebas)

---

## 🔵 Configuración de Google OAuth

### Paso 1: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta Google
3. Crea un nuevo proyecto o selecciona uno existente

### Paso 2: Habilitar Google Identity Services

1. Ve a **APIs & Services** → **Library**
2. Busca **"Google Identity Services API"** y habilítala
3. También busca **"Google+ API"** y habilítala

### Paso 3: Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** → **Credentials**
2. Haz clic en **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Si es la primera vez, configura la **OAuth consent screen**:
   - Aplicación: Selecciona **External** → **Create**
   - Información básica:
     - App name: `Calculadora Trigonométrica`
     - User support email: Tu email
     - Developer contact: Tu email
   - Haz clic en **SAVE AND CONTINUE**

### Paso 4: Configurar Pantalla de Consentimiento

1. En **Scopes**, haz clic en **SAVE AND CONTINUE** (las opciones por defecto están bien)
2. En **Test users**, agrega tu email → **SAVE AND CONTINUE**
3. Ve a **Credentials** nuevamente

### Paso 5: Crear ID Cliente OAuth

1. Haz clic en **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Selecciona **Web application**
3. Nombre: `Calculadora Trigonométrica Web`
4. En **Authorized JavaScript origins**, agrega:
   - `http://localhost:3000`
   - `http://localhost:5000`
   - Tu dominio en producción (ej: `https://tudominio.com`)

5. En **Authorized redirect URIs**, agrega:
   - `http://localhost:3000/`
   - `http://localhost:5000/`
   - Tu URL en producción

6. Haz clic en **Create**

### Paso 6: Obtener Client ID

1. Se abrirá una ventana modal con tu **Client ID**
2. Cópialo (se parece a: `xxxxx-xxxxxxxxx.apps.googleusercontent.com`)

### Paso 7: Actualizar auth.js

En el archivo `auth.js`, reemplaza:

```javascript
const OAUTH_CONFIG = {
    google: {
        clientId: 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // ← AQUÍ
        redirectUri: window.location.origin
    },
    // ...
};
```

---

## 🐙 Configuración de GitHub OAuth

### Paso 1: Acceder a GitHub Settings

1. Ve a [GitHub Settings](https://github.com/settings/profile)
2. En la barra lateral, ve a **Developer settings**
3. Selecciona **OAuth Apps** (o **GitHub Apps** si prefieres)

### Paso 2: Crear Nueva OAuth App

1. Haz clic en **New OAuth App**
2. Completa los campos:
   - **Application name**: `Calculadora Trigonométrica`
   - **Homepage URL**: `http://localhost:3000` (o tu URL)
   - **Authorization callback URL**: `http://localhost:3000/callback.html`
   
3. Haz clic en **Register application**

### Paso 3: Obtener Client ID

1. En la página de la app, verás:
   - **Client ID**: Cópialo
   - **Client Secret**: Cópialo (guárdalo en un lugar seguro)

### Paso 4: Actualizar auth.js

En el archivo `auth.js`, reemplaza:

```javascript
const OAUTH_CONFIG = {
    google: { ... },
    github: {
        clientId: 'TU_GITHUB_CLIENT_ID', // ← AQUÍ
        redirectUri: window.location.origin + '/callback.html',
        scope: 'user:email'
    }
};
```

### Paso 5: Backend (Importante para Producción)

Para producción, necesitarás un backend que:

1. Intercambie el código por un token:
```javascript
POST https://github.com/login/oauth/access_token
Body:
{
  client_id: YOUR_CLIENT_ID,
  client_secret: YOUR_CLIENT_SECRET,
  code: CODE_FROM_CALLBACK
}
```

2. Use el token para obtener datos del usuario:
```javascript
GET https://api.github.com/user
Headers:
{
  Authorization: Bearer ACCESS_TOKEN
}
```

---

## 💻 Instalación Local

### Opción 1: Usar Live Server (Recomendado)

1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"
4. Se abrirá en `http://localhost:5500`

### Opción 2: Python HTTP Server

```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

### Opción 3: Node.js

```bash
# Instala express
npm install -g http-server

# Inicia servidor
http-server -p 3000
```

---

## 🧪 Pruebas

### Verificar Configuración

1. Abre `http://localhost:3000` (o tu URL local)
2. Deberías ver la pantalla de login con 3 opciones:
   - Continuar con Google
   - Continuar con GitHub
   - Email/Contraseña

### Probar Google Login

1. Haz clic en "Continuar con Google"
2. Selecciona tu cuenta de prueba
3. Deberías ser redirigido a la calculadora

### Probar GitHub Login

1. Haz clic en "Continuar con GitHub"
2. Autoriza la aplicación
3. Deberías ser redirigido a la calculadora

### Probar Email Login

1. Ingresa cualquier email y contraseña
2. Haz clic en "Acceder"
3. Deberías ser redirigido a la calculadora

---

## 🚀 Despliegue a Producción

### Pasos Importantes

1. **Actualiza URLs**:
   - En Google OAuth: Agrega tu dominio en authorized origins y redirect URIs
   - En GitHub OAuth: Actualiza la callback URL a `https://tudominio.com/callback.html`

2. **Usa Variables de Entorno**:
```javascript
const OAUTH_CONFIG = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        redirectUri: process.env.REDIRECT_URI
    },
    github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        redirectUri: process.env.REDIRECT_URI
    }
};
```

3. **Backend para GitHub**:
   - Implementa un endpoint que maneje el intercambio de código
   - Protege tu `CLIENT_SECRET`
   - Usa HTTPS en producción

4. **HTTPS Obligatorio**: Todos los servidores OAuth requieren HTTPS en producción

---

## 🛠️ Troubleshooting

### Google Login no funciona

- ✅ Verifica que el Client ID es correcto
- ✅ Verifica que localhost:3000 está en "Authorized JavaScript origins"
- ✅ Abre la consola del navegador (F12) y busca errores

### GitHub Login no funciona

- ✅ Verifica que el Client ID es correcto
- ✅ Verifica que la callback URL coincide exactamente
- ✅ Abre la consola del navegador (F12) y busca errores

### CORS Error

- ✅ Esto generalmente significa que tu backend no está configurado correctamente
- ✅ Para GitHub en producción, DEBES tener un backend

---

## 📚 Recursos Adicionales

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [MDN: Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)

---

## ✅ Checklist de Verificación

- [ ] Google Client ID configurado
- [ ] GitHub Client ID configurado
- [ ] auth.js actualizado con credenciales
- [ ] Servidor local corriendo
- [ ] Probaste Google Login
- [ ] Probaste GitHub Login
- [ ] Probaste Email Login
- [ ] Probaste Logout
- [ ] Limpiar localStorage y probar de nuevo

---

¡Listo! Tu calculadora trigonométrica ahora tiene autenticación social completa. 🎉