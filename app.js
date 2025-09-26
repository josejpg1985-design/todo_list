// 1. Obtener referencias a los elementos del DOM
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const paginationContainer = document.getElementById('pagination-container');
const searchInput = document.getElementById('search-input');

// 2. Almacén de datos y estado
let tasks = []; // Tareas: { text, completed, pendingDelete: { intervalId, countdown } }
let currentPage = 1;
const tasksPerPage = 10;
let searchTerm = '';

// --- Lógica de Tema (Día/Noche) ---
function applyTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        themeToggleBtn.textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
}
themeToggleBtn.addEventListener('click', () => {
    const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(newTheme);
});

// --- Lógica de Tareas (localStorage) ---
function saveTasks() {
    const tasksToSave = tasks.map(task => {
        const { pendingDelete, ...rest } = task; // No guardar el estado de borrado pendiente
        return rest;
    });
    localStorage.setItem('todo-tasks', JSON.stringify(tasksToSave));
}
function loadTasks() {
    const storedTasks = localStorage.getItem('todo-tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// --- Lógica de Renderizado Principal ---
function render() {
    saveTasks();
    const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(searchTerm));
    renderPaginatedTasks(filteredTasks);
    renderPaginationControls(filteredTasks);
}

function renderPaginatedTasks(tasksToRender) {
    taskList.innerHTML = '';
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

        // Mostrar cuenta regresiva si la tarea está pendiente de borrado
        const deleteBtnContent = isPendingDelete ? `↩️ ${task.pendingDelete.countdown}` : '🗑️';

        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="edit-btn" ${isPendingDelete ? 'disabled' : ''}>✏️</button>
                <button class="delete-btn">${deleteBtnContent}</button>
            </div>
        `;
        taskList.appendChild(li);
    }
}

function renderPaginationControls(tasksToRender) {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(tasksToRender.length / tasksPerPage);

    if (totalPages <= 1) return;

    // Botón "Primera"
    const firstButton = document.createElement('button');
    firstButton.classList.add('page-btn');
    firstButton.textContent = '<<';
    firstButton.disabled = currentPage === 1;
    firstButton.addEventListener('click', () => {
        if (currentPage !== 1) {
            currentPage = 1;
            render();
        }
    });
    paginationContainer.appendChild(firstButton);

    // Botón "Anterior"
    const prevButton = document.createElement('button');
    prevButton.classList.add('page-btn');
    prevButton.textContent = 'Anterior';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            render();
        }
    });
    paginationContainer.appendChild(prevButton);

    // Botones de número de página
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('page-btn');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            render();
        });
        paginationContainer.appendChild(pageButton);
    }

    // Botón "Siguiente"
    const nextButton = document.createElement('button');
    nextButton.classList.add('page-btn');
    nextButton.textContent = 'Siguiente';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            render();
        }
    });
    paginationContainer.appendChild(nextButton);

    // Botón "Última"
    const lastButton = document.createElement('button');
    lastButton.classList.add('page-btn');
    lastButton.textContent = '>>';
    lastButton.disabled = currentPage === totalPages;
    lastButton.addEventListener('click', () => {
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            render();
        }
    });
    paginationContainer.appendChild(lastButton);
}

// --- Event Listeners ---
// ... (Búsqueda y Añadir Tarea sin cambios)
searchInput.addEventListener('input', e => {
    searchTerm = e.target.value.toLowerCase();
    currentPage = 1;
    render();
});
addTaskBtn.addEventListener('click', () => {
    const newTaskText = taskInput.value.trim();
    if (newTaskText === '') return;
    const isDuplicate = tasks.some(task => task.text.toLowerCase() === newTaskText.toLowerCase());
    if (isDuplicate) {
        alert('Esa tarea ya existe en la lista.');
        return;
    }
    tasks.unshift({ text: newTaskText, completed: false });
    taskInput.value = '';
    currentPage = 1;
    render();
});
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTaskBtn.click(); } });


// Listener de acciones de lista con lógica de cuenta regresiva
taskList.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;

    const index = parseInt(li.dataset.index, 10);
    const task = tasks[index];
    let shouldRenderNow = false;

    if (e.target.classList.contains('delete-btn')) {
        if (task.pendingDelete) { // --- ACCIÓN DE DESHACER ---
            clearInterval(task.pendingDelete.intervalId);
            delete task.pendingDelete;
            shouldRenderNow = true;
        } else { // --- INICIAR BORRADO CON CUENTA REGRESIVA ---
            // Limpiar cualquier otra eliminación pendiente para evitar confusión
            tasks.forEach(t => {
                if (t.pendingDelete) {
                    clearInterval(t.pendingDelete.intervalId);
                    delete t.pendingDelete;
                }
            });

            task.pendingDelete = { intervalId: null, countdown: 5 };
            
            const intervalId = setInterval(() => {
                if (task.pendingDelete.countdown > 1) {
                    task.pendingDelete.countdown--;
                    render(); // Re-renderizar para mostrar la nueva cuenta
                } else {
                    clearInterval(task.pendingDelete.intervalId);
                    tasks.splice(index, 1); // Eliminar la tarea
                    const totalPages = Math.ceil(tasks.filter(t => t.text.toLowerCase().includes(searchTerm)).length / tasksPerPage);
                    if (currentPage > totalPages) currentPage = totalPages || 1;
                    render(); // Re-renderizar la lista sin la tarea
                }
            }, 1000);

            task.pendingDelete.intervalId = intervalId;
            shouldRenderNow = true;
        }
    } 
    else if (e.target.classList.contains('task-text')) {
        if (!task.pendingDelete) {
            task.completed = !task.completed;
            shouldRenderNow = true;
        }
    } 
    else if (e.target.classList.contains('edit-btn')) {
        if (!task.pendingDelete) {
            const newText = prompt("Edita la tarea:", task.text);
            if (newText !== null && newText.trim() !== '') {
                const isDuplicate = tasks.some((t, i) => i !== index && t.text.toLowerCase() === newText.trim().toLowerCase());
                if (isDuplicate) {
                    alert('Esa tarea ya existe en la lista.');
                } else {
                    task.text = newText.trim();
                    shouldRenderNow = true;
                }
            }
        }
    }
    
    if (shouldRenderNow) render();
});

// --- Carga Inicial ---
function init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    loadTasks();
    render();
}

init();
