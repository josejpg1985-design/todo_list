// 1. Obtener referencias a los elementos del DOM
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const paginationContainer = document.getElementById('pagination-container');
const searchInput = document.getElementById('search-input');
const sortAscBtn = document.getElementById('sort-asc-btn');
const sortDescBtn = document.getElementById('sort-desc-btn');
const taskCounter = document.getElementById('task-counter');
const deleteAllBtn = document.getElementById('delete-all-btn');
const controlsContainer = document.querySelector('.controls-container');
const footerActions = document.querySelector('.footer-actions');
const mainContainer = document.querySelector('.container');

// 2. Almacén de datos y estado
let tasks = [];
let currentPage = 1;
let searchTerm = '';
let tempDeletedTasks = [];
let undoIntervalId = null;

// --- Lógica de Paginación Responsiva ---
function getTasksPerPage() {
    const width = window.innerWidth;
    if (width < 768) return 8;   // Móvil
    if (width < 1024) return 9;  // Tablet
    return 10;                   // PC
}

// --- Lógica de Tema (Día/Noche) ---
function applyTheme(theme) { if (theme === 'dark') { body.classList.add('dark-mode'); themeToggleBtn.textContent = '☀️'; } else { body.classList.remove('dark-mode'); themeToggleBtn.textContent = '🌙'; } localStorage.setItem('theme', theme); }
themeToggleBtn.addEventListener('click', () => { const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark'; applyTheme(newTheme); });

// --- Lógica de Tareas (localStorage) ---
function saveTasks() { const tasksToSave = tasks.map(({ pendingDelete, ...rest }) => rest); localStorage.setItem('todo-tasks', JSON.stringify(tasksToSave)); }
function loadTasks() { const storedTasks = localStorage.getItem('todo-tasks'); if (storedTasks) { tasks = JSON.parse(storedTasks); } }

// --- Lógica de Renderizado Principal ---
function render() {
    saveTasks();
    taskCounter.textContent = tasks.length;

    const tasksPerPage = getTasksPerPage();
    const totalPages = Math.ceil(tasks.filter(task => task.text.toLowerCase().includes(searchTerm)).length / tasksPerPage);
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }

    const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(searchTerm));
    renderPaginatedTasks(filteredTasks);
    renderPaginationControls(filteredTasks);
}

function renderPaginatedTasks(tasksToRender) {
    taskList.innerHTML = '';
    const tasksPerPage = getTasksPerPage();
    const start = (currentPage - 1) * tasksPerPage;
    const end = Math.min(start + tasksPerPage, tasksToRender.length);

    for (let i = start; i < end; i++) {
        const task = tasksToRender[i];
        const originalIndex = tasks.findIndex(originalTask => originalTask === task);
        const li = document.createElement('li');
        li.classList.toggle('completed', task.completed);
        li.dataset.index = originalIndex;
        const isPendingDelete = !!task.pendingDelete;
        li.classList.toggle('pending-delete', isPendingDelete);
        const deleteBtnContent = isPendingDelete ? `↩️ ${task.pendingDelete.countdown}` : '🗑️';
        li.innerHTML = `<span class="task-text">${task.text}</span><div class="task-actions"><button class="edit-btn" ${isPendingDelete ? 'disabled' : ''}>✏️</button><button class="delete-btn">${deleteBtnContent}</button></div>`;
        taskList.appendChild(li);
    }
}

function renderPaginationControls(tasksToRender) {
    paginationContainer.innerHTML = '';
    const tasksPerPage = getTasksPerPage();
    const totalPages = Math.ceil(tasksToRender.length / tasksPerPage);
    if (totalPages <= 1) return;

    const firstButton = document.createElement('button');
    firstButton.classList.add('page-btn');
    firstButton.textContent = '<<';
    firstButton.disabled = currentPage === 1;
    firstButton.addEventListener('click', () => { if (currentPage !== 1) { currentPage = 1; render(); } });
    paginationContainer.appendChild(firstButton);

    const prevButton = document.createElement('button');
    prevButton.classList.add('page-btn');
    prevButton.textContent = 'Anterior';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => { if (currentPage > 1) { currentPage--; render(); } });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('page-btn');
        pageButton.textContent = i;
        if (i === currentPage) pageButton.classList.add('active');
        pageButton.addEventListener('click', () => { currentPage = i; render(); });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.classList.add('page-btn');
    nextButton.textContent = 'Siguiente';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; render(); } });
    paginationContainer.appendChild(nextButton);

    const lastButton = document.createElement('button');
    lastButton.classList.add('page-btn');
    lastButton.textContent = '>>';
    lastButton.disabled = currentPage === totalPages;
    lastButton.addEventListener('click', () => { if (currentPage !== totalPages) { currentPage = totalPages; render(); } });
    paginationContainer.appendChild(lastButton);
}

// --- Lógica de Borrar Todo / Deshacer ---
function showMainContent(show) { /* ...código sin cambios... */ }
function showUndoUI(show, countdown = 0) { /* ...código sin cambios... */ }
function handleUndo() { /* ...código sin cambios... */ }
deleteAllBtn.addEventListener('click', () => { /* ...código sin cambios... */ });

// --- Event Listeners ---
window.addEventListener('resize', render);
searchInput.addEventListener('input', e => { searchTerm = e.target.value.toLowerCase(); currentPage = 1; render(); });
addTaskBtn.addEventListener('click', () => { const newTaskText = taskInput.value.trim(); if (newTaskText === '') return; const isDuplicate = tasks.some(task => task.text.toLowerCase() === newTaskText.toLowerCase()); if (isDuplicate) { alert('Esa tarea ya existe en la lista.'); return; } tasks.unshift({ text: newTaskText, completed: false }); taskInput.value = ''; currentPage = 1; render(); });
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTaskBtn.click(); } });
sortAscBtn.addEventListener('click', () => { tasks.sort((a, b) => a.text.localeCompare(b.text)); currentPage = 1; render(); });
sortDescBtn.addEventListener('click', () => { tasks.sort((a, b) => b.text.localeCompare(a.text)); currentPage = 1; render(); });
taskList.addEventListener('click', e => { const li = e.target.closest('li'); if (!li) return; const index = parseInt(li.dataset.index, 10); const task = tasks[index]; let shouldRenderNow = false; if (e.target.classList.contains('delete-btn')) { if (task.pendingDelete) { clearInterval(task.pendingDelete.intervalId); delete task.pendingDelete; shouldRenderNow = true; } else { tasks.forEach(t => { if (t.pendingDelete) { clearInterval(t.pendingDelete.intervalId); delete t.pendingDelete; } }); task.pendingDelete = { intervalId: null, countdown: 5 }; const intervalId = setInterval(() => { if (task.pendingDelete.countdown > 1) { task.pendingDelete.countdown--; render(); } else { clearInterval(task.pendingDelete.intervalId); tasks.splice(index, 1); const tasksPerPage = getTasksPerPage(); const totalPages = Math.ceil(tasks.filter(t => t.text.toLowerCase().includes(searchTerm)).length / tasksPerPage); if (currentPage > totalPages) currentPage = totalPages || 1; render(); } }, 1000); task.pendingDelete.intervalId = intervalId; shouldRenderNow = true; } } else if (e.target.classList.contains('task-text')) { if (!task.pendingDelete) { task.completed = !task.completed; shouldRenderNow = true; } } else if (e.target.classList.contains('edit-btn')) { if (!task.pendingDelete) { const newText = prompt("Edita la tarea:", task.text); if (newText !== null && newText.trim() !== '') { const isDuplicate = tasks.some((t, i) => i !== index && t.text.toLowerCase() === newText.trim().toLowerCase()); if (isDuplicate) { alert('Esa tarea ya existe en la lista.'); } else { task.text = newText.trim(); shouldRenderNow = true; } } } } if (shouldRenderNow) render(); });

// --- Carga Inicial ---
function init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    loadTasks();
    render();
}

// --- Re-pegar el código de las funciones sin cambios ---
showMainContent = function(show) { const display = show ? 'flex' : 'none'; controlsContainer.style.display = display; taskList.style.display = show ? 'block' : 'none'; paginationContainer.style.display = display; footerActions.style.display = show ? 'block' : 'none'; };
showUndoUI = function(show, countdown = 0) { let oldUndoContainer = document.querySelector('.undo-container'); if(oldUndoContainer) oldUndoContainer.remove(); if (show) { showMainContent(false); const undoContainer = document.createElement('div'); undoContainer.className = 'undo-container'; undoContainer.innerHTML = `<span class="undo-message">Todas las tareas borradas.</span><button class="undo-btn">Deshacer (${countdown})</button>`; mainContainer.insertBefore(undoContainer, taskList); undoContainer.querySelector('.undo-btn').addEventListener('click', handleUndo); } else { showMainContent(true); } };
handleUndo = function() { clearInterval(undoIntervalId); undoIntervalId = null; tasks = [...tempDeletedTasks]; tempDeletedTasks = []; showUndoUI(false); render(); };
deleteAllBtn.addEventListener('click', () => { if (tasks.length === 0) return; clearInterval(undoIntervalId); tempDeletedTasks = [...tasks]; tasks.length = 0; let countdown = 7; showUndoUI(true, countdown); undoIntervalId = setInterval(() => { countdown--; if (countdown > 0) { showUndoUI(true, countdown); } else { clearInterval(undoIntervalId); undoIntervalId = null; tempDeletedTasks = []; showUndoUI(false); render(); } }, 1000); });

init();
