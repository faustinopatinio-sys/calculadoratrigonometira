# 🧮 Calculadora Trigonométrica con Social Login

Una aplicación web interactiva que calcula funciones trigonométricas con autenticación social integrada (Google, GitHub y Email).

![GitHub](https://img.shields.io/badge/GitHub-000?style=for-the-badge&logo=github)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3)

---

## ✨ Características

- **🔐 Autenticación Social**
  - Google OAuth 2.0
  - GitHub OAuth
  - Email/Contraseña

- **🧮 Cálculos Trigonométricos**
  - sin(θ) - Seno
  - cos(θ) - Coseno
  - tan(θ) - Tangente
  - cot(θ) - Cotangente
  - sec(θ) - Secante
  - csc(θ) - Cosecante

- **📐 Unidades Flexibles**
  - Grados (°)
  - Radianes (rad)

- **🎨 Interfaz Moderna**
  - Diseño responsive
  - Gradientes y animaciones
  - Modo oscuro compatible

- **💾 Persistencia**
  - Almacenamiento local de sesión
  - Recordar usuario
  - Tokens seguros

---

## 🚀 Inicio Rápido

### Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet
- (Opcional) Node.js para servidor local

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/faustinopatinio-sys/calculadoratrigonometira.git
   cd calculadoratrigonometira
   ```

2. **Configura las credenciales OAuth**
   
   Sigue la guía en [SETUP.md](./SETUP.md) para:
   - Configurar Google OAuth
   - Configurar GitHub OAuth

3. **Actualiza `auth.js`**
   ```javascript
   const OAUTH_CONFIG = {
       google: {
           clientId: 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
           redirectUri: window.location.origin
       },
       github: {
           clientId: 'TU_GITHUB_CLIENT_ID',
           redirectUri: window.location.origin + '/callback.html',
           scope: 'user:email'
       }
   };
   ```

4. **Ejecuta localmente**
   ```bash
   # Opción 1: Python
   python -m http.server 3000
   
   # Opción 2: Node.js
   npm install
   npm start
   
   # Opción 3: Live Server (VS Code)
   # Clic derecho en index.html → Open with Live Server
   ```

5. **Abre en tu navegador**
   ```
   http://localhost:3000
   ```

---

## 📁 Estructura del Proyecto

```
calculadoratrigonometira/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos y diseño
├── auth.js             # Lógica de autenticación OAuth
├── calculator.js       # Lógica de cálculos trigonométricos
├── callback.html       # Página de callback para GitHub OAuth
├── package.json        # Dependencias del proyecto
├── SETUP.md            # Guía de configuración
└── README.md           # Este archivo
```

---

## 🔐 Autenticación Detallada

### Google OAuth

```javascript
// Flujo:
1. Usuario hace clic en "Continuar con Google"
2. Se abre el diálogo de Google
3. Usuario selecciona su cuenta
4. Se genera un JWT
5. Token se decodifica en el cliente
6. Usuario es autenticado
```

### GitHub OAuth

```javascript
// Flujo:
1. Usuario hace clic en "Continuar con GitHub"
2. Es redirigido a GitHub
3. Autoriza la aplicación
4. GitHub redirige con un código
5. El código se procesa en callback.html
6. Usuario es autenticado
```

### Email/Contraseña

```javascript
// Flujo:
1. Usuario ingresa email y contraseña
2. Se valida el formulario
3. Se crea un usuario local
4. Se guarda la sesión en localStorage
```

---

## 🧮 Cálculos Soportados

### Funciones Trigonométricas

| Función | Entrada | Salida | Fórmula |
|---------|---------|--------|----------|
| Seno | θ (grados/radianes) | -1 a 1 | sin(θ) |
| Coseno | θ | -1 a 1 | cos(θ) |
| Tangente | θ | ℝ | sin(θ)/cos(θ) |
| Cotangente | θ | ℝ | cos(θ)/sin(θ) |
| Secante | θ | -∞ a -1 ∪ 1 a ∞ | 1/cos(θ) |
| Cosecante | θ | -∞ a -1 ∪ 1 a ∞ | 1/sin(θ) |

### Ejemplos de Entrada

- **Grados**: 0, 30, 45, 60, 90, 180, 360
- **Radianes**: 0, π/6, π/4, π/3, π/2, π, 2π
- **Decimales**: 22.5, 45.5, 90.25

---

## 🎨 Personalización

### Colores

Edita los colores en `styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
}
```

### Precisión de Decimales

En `calculator.js`:

```javascript
formatNumber(num, decimals = 6) {
    // Cambiar 6 por el número de decimales deseado
    return parseFloat(num.toFixed(6));
}
```

### Mensajes

Todos los mensajes están en `auth.js` y `calculator.js` - puedes traducirlos fácilmente.

---

## 🔒 Seguridad

### Consideraciones Importantes

⚠️ **Para Producción:**

1. **Nunca** expongas tu `CLIENT_SECRET`
2. Implementa un backend que maneje OAuth
3. Usa HTTPS en producción
4. Valida tokens en el servidor
5. Implementa CSRF protection
6. Usa Content Security Policy (CSP)

### Backend Recomendado (Express.js)

```javascript
app.post('/api/auth/github', async (req, res) => {
    const { code } = req.body;
    
    const token = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        })
    }).then(r => r.json());
    
    const user = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token.access_token}` }
    }).then(r => r.json());
    
    // Crear sesión, retornar JWT, etc.
});
```

---

## 🐛 Troubleshooting

### Problema: "Google no está definido"
**Solución**: Asegúrate de que el script de Google está cargado en `index.html`
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Problema: GitHub login redirige a una página en blanco
**Solución**: Verifica que `callback.html` existe y está en la raíz del proyecto

### Problema: Los cálculos muestran "Indefinido"
**Solución**: Esto ocurre con valores como tan(90°) o cot(0°). Es el comportamiento correcto.

### Problema: Sesión se pierde al recargar
**Solución**: El proyecto usa `localStorage`. Verifica que no esté bloqueado por:
- Modo incógnito/privado del navegador
- Configuración de privacidad del navegador

---

## 📚 Documentación

- [SETUP.md](./SETUP.md) - Guía completa de configuración OAuth
- [Google OAuth Docs](https://developers.google.com/identity)
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios mayores:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Faustino Patinio**
- GitHub: [@faustinopatinio-sys](https://github.com/faustinopatinio-sys)

---

## 🙏 Agradecimientos

- Google por Google Identity Services
- GitHub por GitHub OAuth
- La comunidad open source

---

## 📞 Soporte

¿Preguntas o problemas? Abre un [issue](https://github.com/faustinopatinio-sys/calculadoratrigonometira/issues).

---

## 🎯 Hoja de Ruta (Futuros)

- [ ] Modo oscuro automático
- [ ] Historial de cálculos
- [ ] Gráficos de funciones
- [ ] Exportar resultados como PDF
- [ ] Soporte multiidioma
- [ ] PWA (Progressive Web App)
- [ ] Autenticación de dos factores
- [ ] Base de datos de usuarios

---

<div align="center">

**Hecho con ❤️ por Faustino Patinio**

⭐ Si te gustó este proyecto, considera darle una estrella

</div>