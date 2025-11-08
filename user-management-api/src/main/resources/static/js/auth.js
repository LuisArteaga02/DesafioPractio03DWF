const API_BASE = '/api/auth';

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginCard = document.querySelector('.login-card');
const registerCard = document.getElementById('registerCard');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const alertContainer = document.getElementById('alertContainer');

// Mostrar/ocultar formularios
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
});

// Mostrar alertas
function showAlert(message, type = 'danger') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
}

// Función mejorada para manejar respuestas
async function handleResponse(response) {
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text.substring(0, 200));
        throw new Error(`El servidor devolvió: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Mostrar loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Iniciando sesión...';
    submitBtn.disabled = true;

    try {
        console.log('Enviando login:', { email, password: '***' });

        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Login Response Status:', response.status);
        console.log('Login Response Headers:', Object.fromEntries(response.headers.entries()));

        const data = await handleResponse(response);

        if (response.ok) {
            // Guardar token y usuario CON ID
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.id,           // ← ESTE ES EL CAMPO IMPORTANTE
                name: data.name,
                email: data.email,
                role: data.role
            }));

            showAlert('¡Login exitoso! Redirigiendo...', 'success');

            // Redirigir al dashboard después de 1 segundo
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Error en el login');
        }
    } catch (error) {
        console.error('Error completo en login:', error);
        showAlert('Error de conexión: ' + error.message);
    } finally {
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}); // ← ESTE CIERRA LA FUNCIÓN DEL LOGIN

// Registro
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    // Mostrar loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registrando...';
    submitBtn.disabled = true;

    try {
        console.log('Enviando registro:', { name, email, password: '***' });

        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        console.log('Register Response Status:', response.status);
        console.log('Register Response Headers:', Object.fromEntries(response.headers.entries()));

        const data = await handleResponse(response);

        if (response.ok) {
            showAlert('¡Registro exitoso! Por favor inicia sesión.', 'success');

            // Mostrar formulario de login después de registro exitoso
            setTimeout(() => {
                registerCard.style.display = 'none';
                loginCard.style.display = 'block';
                registerForm.reset();
            }, 2000);
        } else {
            showAlert(data.message || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error completo en registro:', error);
        showAlert('Error de conexión: ' + error.message);
    } finally {
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Verificar si ya está autenticado
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard.html';
    }
}

// Verificar autenticación al cargar la página
checkAuth();