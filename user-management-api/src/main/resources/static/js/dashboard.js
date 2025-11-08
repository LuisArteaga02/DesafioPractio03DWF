const API_BASE = '/api';
let currentUser = null;
let userSubscriptions = [];

// Función para obtener el ID del usuario
function getCurrentUserId() {
    if (!currentUser) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            currentUser = JSON.parse(userStr);
        }
    }

    if (currentUser && currentUser.id) {
        return currentUser.id;
    }

    console.error('Usuario no tiene ID');
    return null;
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// Verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.href = '/';
        return;
    }

    try {
        currentUser = JSON.parse(userStr);
        console.log('Usuario actual:', currentUser);

        if (!currentUser.id) {
            throw new Error('ID de usuario no disponible');
        }

        loadUserInfo();
        initializeDashboard();
        setupEventListeners();
        loadDashboardData();

    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de sesión. Por favor, vuelve a iniciar sesión.', 'danger');
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }, 2000);
    }
}

// Cargar información del usuario
function loadUserInfo() {
    if (currentUser) {
        const userWelcome = document.getElementById('userWelcome');
        const userEmail = document.getElementById('userEmail');

        if (userWelcome) userWelcome.textContent = `Hola, ${currentUser.name || 'Usuario'}`;
        if (userEmail) userEmail.textContent = currentUser.email || 'No disponible';
    }
}

// Inicializar dashboard
function initializeDashboard() {
    // Establecer fechas por defecto en el formulario
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    if (startDate) startDate.value = today;
    if (endDate) endDate.value = nextMonthStr;

    // Establecer el usuario actual en el formulario (oculto)
    const userIdInput = document.getElementById('userId');
    if (userIdInput) {
        userIdInput.value = getCurrentUserId();
    }
}

// Configurar event listeners
// Configurar event listeners
function setupEventListeners() {
    // Formulario de suscripción
    const subscriptionForm = document.getElementById('subscriptionForm');
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', handleSubscriptionSubmit);
    }

    // Cambio en tipo de suscripción
    const subscriptionType = document.getElementById('subscriptionType');
    if (subscriptionType) {
        subscriptionType.addEventListener('change', function() {
            const customType = document.getElementById('customType');
            if (customType) {
                customType.disabled = this.value !== 'CUSTOM';
                if (this.value !== 'CUSTOM') {
                    customType.value = '';
                }
            }
        });
    }

    // Validación de fechas
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate) startDate.addEventListener('change', validateDates);
    if (endDate) endDate.addEventListener('change', validateDates);

    // Listeners para las pestañas de suscripciones
    setupSubscriptionsTabListeners();
}
// Cargar datos del dashboard
async function loadDashboardData() {
    try {
        console.log('Cargando datos del dashboard...');

        // Cargar información del perfil
        loadUserProfile();

        // Cargar suscripciones del usuario actual
        await loadUserSubscriptions();

        console.log('Dashboard cargado exitosamente');

    } catch (error) {
        console.error('Error cargando dashboard:', error);
        showAlert('Error cargando datos: ' + error.message, 'danger');
    }
}

// Cargar suscripciones del usuario
async function loadUserSubscriptions() {
    try {
        const userId = getCurrentUserId();
        if (!userId) {
            throw new Error('ID de usuario no disponible');
        }

        const token = localStorage.getItem('token');
        console.log(`Cargando suscripciones para usuario ${userId}...`);

        const response = await fetch(`${API_BASE}/subscriptions/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        userSubscriptions = await response.json();
        console.log('Suscripciones del usuario:', userSubscriptions);

        // Solo mostrar si el contenedor existe (pestaña activa)
        displayRecentSubscriptions(userSubscriptions);
        updateSubscriptionCounts();

        // Actualizar las pestañas de suscripciones si están activas
        updateSubscriptionsTabs();

    } catch (error) {
        console.error('Error cargando suscripciones:', error);
        // Solo mostrar error si el contenedor existe
        const container = document.getElementById('recentSubscriptions');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                    Error cargando suscripciones: ${error.message}
                </div>
            `;
        }
    }
}

// Mostrar suscripciones recientes (CON VERIFICACIÓN DE ELEMENTO)
function displayRecentSubscriptions(subscriptions) {
    const container = document.getElementById('recentSubscriptions');

    if (!container) {
        console.log('Container #recentSubscriptions no encontrado (puede que la pestaña no esté activa)');
        return;
    }

    if (!subscriptions || subscriptions.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <div class="d-flex align-items-center">
                    <i class="bi bi-info-circle me-2"></i>
                    <div>
                        <strong>No tienes suscripciones aún.</strong><br>
                        <small class="text-muted">Comienza creando tu primera suscripción.</small>
                    </div>
                </div>
                <div class="mt-2">
                    <a href="#new-subscription" class="btn btn-primary btn-sm" onclick="showNewSubscriptionTab()">
                        <i class="bi bi-plus-circle"></i> Crear primera suscripción
                    </a>
                </div>
            </div>
        `;
        return;
    }

    console.log('Mostrando suscripciones:', subscriptions);

    let html = `
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-dark">
                    <tr>
                        <th><i class="bi bi-tag"></i> Tipo</th>
                        <th><i class="bi bi-calendar-plus"></i> Inicio</th>
                        <th><i class="bi bi-calendar-check"></i> Fin</th>
                        <th><i class="bi bi-circle-fill"></i> Estado</th>
                        <th><i class="bi bi-actions"></i> Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Ordenar por fecha de inicio (más recientes primero)
    const sortedSubs = subscriptions.sort((a, b) =>
        new Date(b.startDate) - new Date(a.startDate)
    );

    sortedSubs.forEach(sub => {
        const isActive = isSubscriptionActive(sub);
        const isFuture = isSubscriptionFuture(sub);
        const statusClass = isActive ? 'bg-success' : (isFuture ? 'bg-warning' : 'bg-secondary');
        const statusText = isActive ? 'Activa' : (isFuture ? 'Futura' : 'Expirada');
        const statusIcon = isActive ? 'bi-play-circle' : (isFuture ? 'bi-clock' : 'bi-x-circle');

        html += `
            <tr>
                <td>
                    <strong>${sub.type}</strong>
                    ${sub.id ? `<br><small class="text-muted">ID: ${sub.id}</small>` : ''}
                </td>
                <td>${formatDate(sub.startDate)}</td>
                <td>${formatDate(sub.endDate)}</td>
                <td>
                    <span class="badge ${statusClass}">
                        <i class="bi ${statusIcon} me-1"></i>${statusText}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewSubscriptionDetails(${sub.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteSubscription(${sub.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;

    // Agregar resumen
    const activeCount = subscriptions.filter(sub => isSubscriptionActive(sub)).length;
    const futureCount = subscriptions.filter(sub => isSubscriptionFuture(sub)).length;
    const expiredCount = subscriptions.filter(sub => !isSubscriptionActive(sub) && !isSubscriptionFuture(sub)).length;

    const summaryHtml = `
        <div class="alert alert-light border mt-3">
            <div class="row text-center">
                <div class="col-4">
                    <span class="text-success"><strong>${activeCount}</strong> activas</span>
                </div>
                <div class="col-4">
                    <span class="text-warning"><strong>${futureCount}</strong> futuras</span>
                </div>
                <div class="col-4">
                    <span class="text-secondary"><strong>${expiredCount}</strong> expiradas</span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html + summaryHtml;
}

// Actualizar contadores (CON VERIFICACIÓN)
function updateSubscriptionCounts() {
    const activeSubs = userSubscriptions.filter(sub => isSubscriptionActive(sub));
    const expiringSubs = userSubscriptions.filter(sub => isSubscriptionExpiringSoon(sub));

    const totalCount = document.getElementById('totalSubscriptionsCount');
    const activeCount = document.getElementById('activeSubscriptionsCount');
    const expiringCount = document.getElementById('expiringSubscriptionsCount');

    if (totalCount) totalCount.textContent = userSubscriptions.length;
    if (activeCount) activeCount.textContent = activeSubs.length;
    if (expiringCount) expiringCount.textContent = expiringSubs.length;
}

// Manejar envío del formulario de suscripción
async function handleSubscriptionSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-arrow-repeat spinner-border spinner-border-sm"></i> Creando...';
    submitBtn.disabled = true;

    try {
        const subscriptionType = document.getElementById('subscriptionType');
        const customType = document.getElementById('customType');
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');

        if (!subscriptionType || !startDate || !endDate) {
            throw new Error('Formulario incompleto');
        }

        const finalType = subscriptionType.value === 'CUSTOM' ? (customType ? customType.value : 'CUSTOM') : subscriptionType.value;
        const userId = getCurrentUserId();

        if (!userId) {
            throw new Error('ID de usuario no disponible');
        }

        const subscriptionData = {
            type: finalType,
            startDate: startDate.value,
            endDate: endDate.value,
            userId: userId
        };

        console.log('Enviando datos de suscripción:', subscriptionData);

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(subscriptionData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Error ${response.status}`);
        }

        const newSubscription = await response.json();
        console.log('Suscripción creada:', newSubscription);

        showAlert('¡Suscripción creada exitosamente!', 'success');
        resetSubscriptionForm();

        // Recargar datos
        await loadUserSubscriptions();

    } catch (error) {
        console.error('Error creando suscripción:', error);
        showAlert('Error creando suscripción: ' + error.message, 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Ver detalles de suscripción
async function viewSubscriptionDetails(subscriptionId) {
    try {
        // Verificar que la suscripción pertenece al usuario actual
        const userSubscription = userSubscriptions.find(sub => sub.id === subscriptionId);
        if (!userSubscription) {
            throw new Error('No tienes permisos para ver esta suscripción');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const subscription = await response.json();
        showSubscriptionModal(subscription);

    } catch (error) {
        console.error('Error cargando detalles:', error);
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Mostrar modal de detalles (CON VERIFICACIÓN)
function showSubscriptionModal(subscription) {
    const modalBody = document.getElementById('subscriptionModalBody');
    if (!modalBody) {
        console.error('Modal body no encontrado');
        return;
    }

    const isActive = isSubscriptionActive(subscription);
    const isFuture = isSubscriptionFuture(subscription);
    const daysRemaining = getDaysRemaining(subscription.endDate);

    modalBody.innerHTML = `
        <div class="row">
            <div class="col-12">
                <h4>${subscription.type}</h4>
                <p><strong>ID:</strong> ${subscription.id}</p>
                <p><strong>Usuario:</strong> ${currentUser.name} (${currentUser.email})</p>
                <p><strong>Fecha inicio:</strong> ${formatDate(subscription.startDate)}</p>
                <p><strong>Fecha fin:</strong> ${formatDate(subscription.endDate)}</p>
                <p><strong>Estado:</strong>
                    <span class="badge ${isActive ? 'bg-success' : (isFuture ? 'bg-warning' : 'bg-danger')}">
                        ${isActive ? 'Activa' : (isFuture ? 'Futura' : 'Expirada')}
                    </span>
                </p>
                ${isActive ? `<p><strong>Días restantes:</strong> ${daysRemaining}</p>` : ''}
                ${isFuture ? `<p><strong>Inicia en:</strong> ${getDaysUntilStart(subscription.startDate)} días</p>` : ''}
                <p><strong>Válida:</strong> ${isSubscriptionValid(subscription) ? 'Sí' : 'No'}</p>
            </div>
        </div>
    `;

    const modalElement = document.getElementById('subscriptionModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Eliminar suscripción
async function deleteSubscription(subscriptionId) {
    // Verificar que la suscripción pertenece al usuario actual
    const userSubscription = userSubscriptions.find(sub => sub.id === subscriptionId);
    if (!userSubscription) {
        showAlert('No tienes permisos para eliminar esta suscripción', 'danger');
        return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta suscripción?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        showAlert('¡Suscripción eliminada exitosamente!', 'success');
        await loadUserSubscriptions();

    } catch (error) {
        console.error('Error eliminando suscripción:', error);
        showAlert('Error eliminando suscripción: ' + error.message, 'danger');
    }
}

// Cargar información del perfil del usuario (CON VERIFICACIÓN)
function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    const profileContainer = document.getElementById('userProfileInfo');
    const statsContainer = document.getElementById('userStats');

    if (!profileContainer) {
        console.log('Perfil container no encontrado (pestaña posiblemente no activa)');
        return;
    }

    if (!user) {
        profileContainer.innerHTML = `
            <div class="alert alert-warning">
                No se pudo cargar la información del usuario.
            </div>
        `;
        return;
    }

    const profileHtml = `
        <div class="row">
            <div class="col-md-6">
                <table class="table table-borderless">
                    <tr>
                        <th width="40%"><i class="bi bi-person"></i> Nombre:</th>
                        <td>${user.name || 'No disponible'}</td>
                    </tr>
                    <tr>
                        <th><i class="bi bi-envelope"></i> Email:</th>
                        <td>${user.email || 'No disponible'}</td>
                    </tr>
                    <tr>
                        <th><i class="bi bi-shield"></i> Rol:</th>
                        <td>
                            <span class="badge bg-primary">${user.role || 'USER'}</span>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <table class="table table-borderless">
                    <tr>
                        <th width="40%"><i class="bi bi-calendar"></i> ID Usuario:</th>
                        <td>${user.id || 'No disponible'}</td>
                    </tr>
                    <tr>
                        <th><i class="bi bi-clock"></i> Sesión activa:</th>
                        <td>
                            <span class="badge bg-success">Activa</span>
                        </td>
                    </tr>
                    <tr>
                        <th><i class="bi bi-key"></i> Token:</th>
                        <td>
                            <small class="text-muted">${localStorage.getItem('token') ? 'Presente' : 'No disponible'}</small>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="mt-4">
            <h6><i class="bi bi-gear"></i> Acciones</h6>
            <div class="btn-group">
                <button class="btn btn-outline-primary btn-sm" onclick="showUserDetails()">
                    <i class="bi bi-eye"></i> Ver detalles completos
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="refreshProfile()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>
        </div>
    `;

    profileContainer.innerHTML = profileHtml;

    // Cargar estadísticas solo si el contenedor existe
    if (statsContainer) {
        loadUserStats();
    }
}

// Cargar estadísticas del usuario (CON VERIFICACIÓN)
function loadUserStats() {
    const statsContainer = document.getElementById('userStats');
    if (!statsContainer) {
        return;
    }

    const activeSubs = userSubscriptions.filter(sub => isSubscriptionActive(sub));
    const futureSubs = userSubscriptions.filter(sub => isSubscriptionFuture(sub));
    const expiredSubs = userSubscriptions.filter(sub => !isSubscriptionActive(sub) && !isSubscriptionFuture(sub));

    const statsHtml = `
        <div class="text-center">
            <div class="mb-3">
                <h3 class="text-primary">${userSubscriptions.length}</h3>
                <small class="text-muted">Total Suscripciones</small>
            </div>
            <div class="row">
                <div class="col-4">
                    <div class="mb-2">
                        <h5 class="text-success mb-0">${activeSubs.length}</h5>
                        <small class="text-muted">Activas</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="mb-2">
                        <h5 class="text-warning mb-0">${futureSubs.length}</h5>
                        <small class="text-muted">Futuras</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="mb-2">
                        <h5 class="text-danger mb-0">${expiredSubs.length}</h5>
                        <small class="text-muted">Expiradas</small>
                    </div>
                </div>
            </div>
        </div>
    `;

    statsContainer.innerHTML = statsHtml;
}

// Mostrar detalles completos del usuario
function showUserDetails() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const userDetails = `
        <strong>Información completa del usuario:</strong>
        <pre class="mt-2 p-3 bg-light rounded" style="font-size: 0.8rem;">${JSON.stringify(user, null, 2)}</pre>

        <strong>Token (primeros 50 caracteres):</strong>
        <pre class="mt-2 p-3 bg-light rounded" style="font-size: 0.8rem;">${token ? token.substring(0, 50) + '...' : 'No disponible'}</pre>
    `;

    // Crear un modal temporal para mostrar los detalles
    const modalHtml = `
        <div class="modal fade" id="userDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalles Completos del Usuario</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${userDetails}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar el modal al DOM si no existe
    if (!document.getElementById('userDetailsModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const modalElement = document.getElementById('userDetailsModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Actualizar perfil
function refreshProfile() {
    showAlert('Perfil actualizado', 'info');
    loadUserProfile();
    loadUserSubscriptions();
}

// Utilidades (las mismas que antes)
function isSubscriptionActive(subscription) {
    if (!subscription.startDate || !subscription.endDate) return false;
    const today = new Date().toISOString().split('T')[0];
    const startDate = subscription.startDate.split('T')[0];
    const endDate = subscription.endDate.split('T')[0];
    return startDate <= today && endDate >= today;
}

function isSubscriptionFuture(subscription) {
    if (!subscription.startDate) return false;
    const today = new Date().toISOString().split('T')[0];
    const startDate = subscription.startDate.split('T')[0];
    return startDate > today;
}

function isSubscriptionExpiringSoon(subscription, days = 7) {
    if (!isSubscriptionActive(subscription)) return false;
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays > 0;
}

function isSubscriptionValid(subscription) {
    if (!subscription.startDate || !subscription.endDate) return false;
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);
    return endDate > startDate;
}

function getDaysRemaining(endDate) {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDaysUntilStart(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = start - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    } catch (error) {
        console.error('Error formateando fecha:', dateString, error);
        return 'Fecha inválida';
    }
}

function validateDates() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    if (startDate && endDate) {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);

        if (end <= start) {
            endDate.setCustomValidity('La fecha de fin debe ser posterior a la fecha de inicio');
        } else {
            endDate.setCustomValidity('');
        }
    }
}

function resetSubscriptionForm() {
    const form = document.getElementById('subscriptionForm');
    if (form) {
        form.reset();
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];

        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        const customType = document.getElementById('customType');

        if (startDate) startDate.value = today;
        if (endDate) endDate.value = nextMonthStr;
        if (customType) customType.disabled = true;
    }
}

function showNewSubscriptionTab() {
    const triggerEl = document.querySelector('a[href="#new-subscription"]');
    if (triggerEl) {
        const tab = new bootstrap.Tab(triggerEl);
        tab.show();
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        console.log('Alert:', message);
        return;
    }

    const alertId = 'alert-' + Date.now();

    const alertDiv = document.createElement('div');
    alertDiv.id = alertId;
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    alertContainer.appendChild(alertDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.remove();
        }
    }, 5000);
}
// Función para cargar y mostrar todas las suscripciones del usuario
function loadAllSubscriptionsTab() {
    const container = document.getElementById('allSubscriptionsList');
    if (!container) {
        console.log('Container allSubscriptionsList no encontrado');
        return;
    }

    if (!userSubscriptions || userSubscriptions.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <div class="d-flex align-items-center">
                    <i class="bi bi-info-circle me-2"></i>
                    <div>
                        <strong>No tienes suscripciones aún.</strong><br>
                        <small class="text-muted">Comienza creando tu primera suscripción.</small>
                    </div>
                </div>
                <div class="mt-2">
                    <a href="#new-subscription" class="btn btn-primary btn-sm" onclick="showNewSubscriptionTab()">
                        <i class="bi bi-plus-circle"></i> Crear primera suscripción
                    </a>
                </div>
            </div>
        `;
        return;
    }

    let html = `
        <table class="table table-hover table-striped">
            <thead class="table-dark">
                <tr>
                    <th><i class="bi bi-hash"></i> ID</th>
                    <th><i class="bi bi-tag"></i> Tipo</th>
                    <th><i class="bi bi-calendar-plus"></i> Inicio</th>
                    <th><i class="bi bi-calendar-check"></i> Fin</th>
                    <th><i class="bi bi-circle-fill"></i> Estado</th>
                    <th><i class="bi bi-actions"></i> Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Ordenar por ID (más recientes primero)
    const sortedSubs = userSubscriptions.sort((a, b) => b.id - a.id);

    sortedSubs.forEach(sub => {
        const isActive = isSubscriptionActive(sub);
        const isFuture = isSubscriptionFuture(sub);
        const statusClass = isActive ? 'bg-success' : (isFuture ? 'bg-warning' : 'bg-secondary');
        const statusText = isActive ? 'Activa' : (isFuture ? 'Futura' : 'Expirada');
        const statusIcon = isActive ? 'bi-play-circle' : (isFuture ? 'bi-clock' : 'bi-x-circle');

        html += `
            <tr>
                <td><strong>${sub.id}</strong></td>
                <td><strong>${sub.type}</strong></td>
                <td>${formatDate(sub.startDate)}</td>
                <td>${formatDate(sub.endDate)}</td>
                <td>
                    <span class="badge ${statusClass}">
                        <i class="bi ${statusIcon} me-1"></i>${statusText}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewSubscriptionDetails(${sub.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteSubscription(${sub.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;

    // Agregar resumen
    const activeCount = userSubscriptions.filter(sub => isSubscriptionActive(sub)).length;
    const futureCount = userSubscriptions.filter(sub => isSubscriptionFuture(sub)).length;
    const expiredCount = userSubscriptions.filter(sub => !isSubscriptionActive(sub) && !isSubscriptionFuture(sub)).length;

    const summaryHtml = `
        <div class="alert alert-light border mt-3">
            <div class="row text-center">
                <div class="col-4">
                    <span class="text-success">
                        <i class="bi bi-check-circle"></i>
                        <strong>${activeCount}</strong> activas
                    </span>
                </div>
                <div class="col-4">
                    <span class="text-warning">
                        <i class="bi bi-clock"></i>
                        <strong>${futureCount}</strong> futuras
                    </span>
                </div>
                <div class="col-4">
                    <span class="text-secondary">
                        <i class="bi bi-x-circle"></i>
                        <strong>${expiredCount}</strong> expiradas
                    </span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html + summaryHtml;
}

// Función para cargar y mostrar solo las suscripciones activas
function loadActiveSubscriptionsTab() {
    const container = document.getElementById('activeSubscriptionsList');
    if (!container) {
        console.log('Container activeSubscriptionsList no encontrado');
        return;
    }

    const activeSubscriptions = userSubscriptions.filter(sub => isSubscriptionActive(sub));

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <div class="d-flex align-items-center">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <div>
                        <strong>No tienes suscripciones activas en este momento.</strong><br>
                        <small class="text-muted">Todas tus suscripciones están expiradas o son futuras.</small>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    let html = `
        <table class="table table-hover table-striped">
            <thead class="table-dark">
                <tr>
                    <th><i class="bi bi-hash"></i> ID</th>
                    <th><i class="bi bi-tag"></i> Tipo</th>
                    <th><i class="bi bi-calendar-plus"></i> Inicio</th>
                    <th><i class="bi bi-calendar-check"></i> Fin</th>
                    <th><i class="bi bi-clock"></i> Días Restantes</th>
                    <th><i class="bi bi-actions"></i> Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Ordenar por días restantes (menos días primero)
    const sortedSubs = activeSubscriptions.sort((a, b) => {
        const daysA = getDaysRemaining(a.endDate);
        const daysB = getDaysRemaining(b.endDate);
        return daysA - daysB;
    });

    sortedSubs.forEach(sub => {
        const daysRemaining = getDaysRemaining(sub.endDate);
        const daysClass = daysRemaining <= 7 ? 'text-danger' : (daysRemaining <= 30 ? 'text-warning' : 'text-success');

        html += `
            <tr>
                <td><strong>${sub.id}</strong></td>
                <td><strong>${sub.type}</strong></td>
                <td>${formatDate(sub.startDate)}</td>
                <td>${formatDate(sub.endDate)}</td>
                <td>
                    <span class="${daysClass} fw-bold">
                        <i class="bi bi-alarm"></i> ${daysRemaining} días
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewSubscriptionDetails(${sub.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteSubscription(${sub.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;

    const summaryHtml = `
        <div class="alert alert-success">
            <div class="row text-center">
                <div class="col-12">
                    <i class="bi bi-check-circle-fill"></i>
                    <strong>${activeSubscriptions.length} suscripción(es) activa(s)</strong>
                    <br>
                    <small class="text-muted">Estas son tus suscripciones actualmente en vigor</small>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html + summaryHtml;
}

// Función para actualizar ambas pestañas de suscripciones
function updateSubscriptionsTabs() {
    loadAllSubscriptionsTab();
    loadActiveSubscriptionsTab();
}

// Event listeners para las pestañas de suscripciones
function setupSubscriptionsTabListeners() {
    // Cuando se hace clic en la pestaña "Suscripciones"
    const subscriptionsTab = document.querySelector('a[href="#subscriptions"]');
    if (subscriptionsTab) {
        subscriptionsTab.addEventListener('shown.bs.tab', function() {
            console.log('Pestaña Suscripciones activada');
            updateSubscriptionsTabs();
        });
    }

    // Cuando se cambia entre "Todas" y "Activas" dentro de la pestaña Suscripciones
    const allSubsTab = document.querySelector('a[href="#all-subscriptions"]');
    const activeSubsTab = document.querySelector('a[href="#active-subscriptions"]');

    if (allSubsTab) {
        allSubsTab.addEventListener('shown.bs.tab', function() {
            console.log('Mostrando todas las suscripciones');
            loadAllSubscriptionsTab();
        });
    }

    if (activeSubsTab) {
        activeSubsTab.addEventListener('shown.bs.tab', function() {
            console.log('Mostrando suscripciones activas');
            loadActiveSubscriptionsTab();
        });
    }
}


// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});