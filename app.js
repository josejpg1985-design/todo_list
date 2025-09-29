// 1. Obtener referencias a los elementos del DOM
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const taskCounter = document.getElementById('task-counter');
const newListInput = document.getElementById('new-list-input');
const addListBtn = document.getElementById('add-list-btn');
const listsContainer = document.getElementById('lists-container');

// 2. Almacén de datos y estado
let lists = [];

// --- Lógica de Utilidad ---
function clearAllPendingDeletes() {
    lists.forEach(l => {
        if (l.pendingDeleteAll) {
            clearInterval(l.pendingDeleteAll.intervalId);
            delete l.pendingDeleteAll;
        }
        if (l.tasks) {
            l.tasks.forEach(t => {
                if (t.pendingDelete) {
                    clearInterval(t.pendingDelete.intervalId);
                    delete t.pendingDelete;
                }
            });
        }
    });
}

// --- Lógica de Tema (Día/Noche) ---
function applyTheme(theme) { if (theme === 'dark') { body.classList.add('dark-mode'); themeToggleBtn.textContent = '☀️'; } else { body.classList.remove('dark-mode'); themeToggleBtn.textContent = '🌙'; } localStorage.setItem('theme', theme); }
themeToggleBtn.addEventListener('click', () => { const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark'; applyTheme(newTheme); });

// --- Lógica de Listas (localStorage) ---
function saveLists() {
    localStorage.setItem('todo-lists', JSON.stringify(lists));
}

function loadLists() {
    const storedLists = localStorage.getItem('todo-lists');
    if (storedLists) {
        lists = JSON.parse(storedLists);
    }
}

// --- Lógica de Renderizado Principal ---
function render() {
    saveLists();
    listsContainer.innerHTML = '';

    lists.forEach(list => {
        const listElement = document.createElement('div');
        listElement.classList.add('list-accordion');

        const isExpanded = list.isExpanded || false;
        listElement.innerHTML = `
            <div class="list-header" data-list-id="${list.id}">
                <div class="list-title-container">
                    <h3>${list.name}</h3>
                    <button class="edit-list-btn">✏️</button>
                </div>
                <span class="list-controls">
                    <button class="delete-list-btn danger-btn">🗑️</button>
                    <button class="toggle-list-btn">${isExpanded ? '-' : '+'}</button>
                </span>
            </div>
            <div class="list-body" style="display: ${isExpanded ? 'block' : 'none'}"></div>
        `;

        const listBody = listElement.querySelector('.list-body');

        if (list.pendingDeleteAll) {
            listBody.innerHTML = `
                <div class="undo-container">
                    <span class="undo-message">Todas las tareas borradas.</span>
                    <button class="undo-delete-all-btn danger-btn" data-list-id="${list.id}">Deshacer (${list.pendingDeleteAll.countdown})</button>
                </div>
            `;
        } else {
            listBody.innerHTML = `
                <div class="task-controls-header">
                    <div class="input-container task-input-container">
                        <input type="text" class="task-input" placeholder="Añadir nueva tarea...">
                        <button class="add-task-btn">Agregar</button>
                    </div>
                    <div class="sort-container">
                        <button class="sort-btn sort-asc-btn ${list.sortOrder === 'asc' ? 'active' : ''}" title="Ordenar A-Z">A-Z ↓</button>
                        <button class="sort-btn sort-desc-btn ${list.sortOrder === 'desc' ? 'active' : ''}" title="Ordenar Z-A">Z-A ↑</button>
                    </div>
                </div>
                <ul class="task-list"></ul>
                <div class="list-footer-actions">
                    <button class="delete-all-tasks-btn danger-btn">Borrar Todas las Tareas</button>
                </div>
            `;

            const taskListUl = listBody.querySelector('.task-list');
            if (list.tasks && list.tasks.length > 0) {
                let tasksToRender = [...list.tasks];
                if (list.sortOrder === 'asc') {
                    tasksToRender.sort((a, b) => a.text.localeCompare(b.text));
                } else if (list.sortOrder === 'desc') {
                    tasksToRender.sort((a, b) => b.text.localeCompare(a.text));
                }

<<<<<<< HEAD
                if (list.sortOrder === 'asc') {
                    tasksToRender.sort((a, b) => a.text.localeCompare(b.text));
                } else if (list.sortOrder === 'desc') {
                    tasksToRender.sort((a, b) => b.text.localeCompare(a.text));
                }

                tasksToRender.forEach((task, index) => {
                    const originalIndex = list.tasks.findIndex(originalTask => originalTask === task);
                    const taskLi = document.createElement('li');
=======
                tasksToRender.forEach((task, index) => {
>>>>>>> feature/numeracion-tareas
                    const originalIndex = list.tasks.findIndex(originalTask => originalTask === task);
                    const taskLi = document.createElement('li');
                    taskLi.dataset.taskIndex = originalIndex;
                    taskLi.classList.toggle('completed', task.completed);

                    if (task.pendingDelete) {
                        taskLi.classList.add('pending-delete');
                        taskLi.innerHTML = `
                            <span class="task-text">Borrando...</span>
                            <div class="task-actions">
                                <button class="undo-task-btn">Deshacer (${task.pendingDelete.countdown})</button>
                            </div>
                        `;
                    } else {
                        taskLi.innerHTML = `
                            <span class="task-number">${index + 1}.</span>
                            <span class="task-text">${task.text}</span>
                            <div class="task-actions">
                                <button class="edit-btn">✏️</button>
                                <button class="delete-btn">🗑️</button>
                            </div>
                        `;
                    }
                    taskListUl.appendChild(taskLi);
                });
            }
        }
        listsContainer.appendChild(listElement);
    });
}

// --- Lógica para añadir una nueva lista ---
function addNewList() {
    const listName = newListInput.value.trim();
    if (listName === '') {
        alert('Por favor, dale un nombre a tu lista.');
        return;
    }
    const isDuplicate = lists.some(list => list.name.toLowerCase() === listName.toLowerCase());
    if (isDuplicate) {
        alert('Ya existe una lista con ese nombre.');
        return;
    }
    lists.unshift({
        id: Date.now(),
        name: listName,
        tasks: [],
        isExpanded: false,
        sortOrder: 'none' // Propiedad para ordenamiento
    });
    newListInput.value = '';
    render();
    newListInput.focus();
}

// --- Event Listeners ---
addListBtn.addEventListener('click', addNewList);
newListInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addNewList();
    }
});

listsContainer.addEventListener('click', e => {
    const editListBtn = e.target.closest('.edit-list-btn');
    if (editListBtn) {
        const listId = parseInt(editListBtn.closest('.list-header').dataset.listId, 10);
        const list = lists.find(l => l.id === listId);
        if (list) {
            const newName = prompt("Nuevo nombre para la lista:", list.name);
            if (newName !== null && newName.trim() !== '') {
                const isDuplicate = lists.some(l => l.name.toLowerCase() === newName.trim().toLowerCase() && l.id !== listId);
                if (isDuplicate) {
                    alert('Ya existe una lista con ese nombre.');
                } else {
                    list.name = newName.trim();
                    render();
                }
            }
            return;
        }
    }

    const deleteListBtn = e.target.closest('.delete-list-btn');
    if (deleteListBtn) {
        const listId = parseInt(deleteListBtn.closest('.list-header').dataset.listId, 10);
        const list = lists.find(l => l.id === listId);
        if (list) {
            if (list.tasks.length > 0) {
                alert('No puedes borrar una lista que contiene tareas. Bórralas primero.');
            } else {
                if (confirm(`¿Estás seguro de que quieres eliminar la lista "${list.name}"?`)) {
                    const listIndex = lists.findIndex(l => l.id === listId);
                    if (listIndex > -1) {
                        lists.splice(listIndex, 1);
                        render();
                    }
                }
            }
            return;
        }
    }

    const listHeader = e.target.closest('.list-header');
    if (listHeader) {
        const listId = parseInt(listHeader.dataset.listId, 10);
        const list = lists.find(l => l.id === listId);
        if (list) {
            list.isExpanded = !list.isExpanded;
            render();
            return;
        }
    }

    const sortAscBtn = e.target.closest('.sort-asc-btn');
    if (sortAscBtn) {
        const listId = parseInt(sortAscBtn.closest('.list-accordion').querySelector('.list-header').dataset.listId, 10);
        const list = lists.find(l => l.id === listId);
        if (list) {
            list.sortOrder = list.sortOrder === 'asc' ? 'none' : 'asc';
            render();
            return;
        }
    }

    const sortDescBtn = e.target.closest('.sort-desc-btn');
    if (sortDescBtn) {
        const listId = parseInt(sortDescBtn.closest('.list-accordion').querySelector('.list-header').dataset.listId, 10);
        const list = lists.find(l => l.id === listId);
        if (list) {
            list.sortOrder = list.sortOrder === 'desc' ? 'none' : 'desc';
            render();
            return;
        }
    }

    const addTaskBtn = e.target.closest('.add-task-btn');
    if (addTaskBtn) {
        const listId = parseInt(addTaskBtn.closest('.list-accordion').querySelector('.list-header').dataset.listId, 10);
        const list = lists.find(l => l.id === listId);
        if (list) {
            const taskInput = addTaskBtn.closest('.input-container').querySelector('.task-input');
            const newTaskText = taskInput.value.trim();
            if (newTaskText === '') return;
            const isDuplicate = list.tasks.some(task => task.text.toLowerCase() === newTaskText.toLowerCase());
            if (isDuplicate) {
                alert('Esa tarea ya existe en esta lista.');
                return;
            }
            list.tasks.unshift({ text: newTaskText, completed: false });
            taskInput.value = '';
            render();
            const newListElement = listsContainer.querySelector(`.list-header[data-list-id="${listId}"]`).parentElement;
            const newInput = newListElement.querySelector('.task-input');
            if (newInput) newInput.focus();
            return;
        }
    }

    const taskLi = e.target.closest('li[data-task-index]');
    if (taskLi) {
        const listId = parseInt(taskLi.closest('.list-accordion').querySelector('.list-header').dataset.listId, 10);
        const list = lists.find(l => l.id === listId);
        const taskIndex = parseInt(taskLi.dataset.taskIndex, 10);
        const task = list.tasks[taskIndex];
        if (!list || !task) return;

        if (e.target.closest('.undo-task-btn')) {
            if (task.pendingDelete) {
                clearInterval(task.pendingDelete.intervalId);
                delete task.pendingDelete;
            }
        } else if (e.target.closest('.delete-btn')) {
            clearAllPendingDeletes();
            task.pendingDelete = {
                countdown: 5,
                intervalId: setInterval(() => {
                    if (task.pendingDelete && task.pendingDelete.countdown > 1) {
                        task.pendingDelete.countdown--;
                    } else {
                        clearInterval(task.pendingDelete.intervalId);
                        const currentIndex = list.tasks.findIndex(t => t === task);
                        if (currentIndex !== -1) list.tasks.splice(currentIndex, 1);
                    }
                    render();
                }, 1000)
            };
        } else if (!task.pendingDelete) {
            if (e.target.classList.contains('task-text')) {
                task.completed = !task.completed;
            }
            if (e.target.classList.contains('edit-btn')) {
                const newText = prompt("Edita la tarea:", task.text);
                if (newText !== null && newText.trim() !== '') {
                    const isDuplicate = list.tasks.some((t, i) => i !== taskIndex && t.text.toLowerCase() === newText.trim().toLowerCase());
                    if (isDuplicate) {
                        alert('Esa tarea ya existe en la lista.');
                    } else {
                        task.text = newText.trim();
                    }
                }
            }
        }
        render();
        return;
    }

    const deleteAllBtn = e.target.closest('.delete-all-tasks-btn');
    if (deleteAllBtn) {
        const listId = parseInt(deleteAllBtn.closest('.list-accordion').querySelector('.list-header').dataset.listId, 10);
        const list = lists.find(l => l.id === listId);
        if (list && list.tasks.length > 0) {
            clearAllPendingDeletes();
            list.pendingDeleteAll = {
                tempTasks: [...list.tasks],
                countdown: 7,
                intervalId: setInterval(() => {
                    if (list.pendingDeleteAll && list.pendingDeleteAll.countdown > 1) {
                        list.pendingDeleteAll.countdown--;
                    } else {
                        clearInterval(list.pendingDeleteAll.intervalId);
                        delete list.pendingDeleteAll;
                    }
                    render();
                }, 1000)
            };
            list.tasks = [];
            render();
            return;
        }
    }

    const undoDeleteAllBtn = e.target.closest('.undo-delete-all-btn');
    if (undoDeleteAllBtn) {
        const listId = parseInt(undoDeleteAllBtn.dataset.listId, 10);
        const list = lists.find(l => l.id === listId);
        if (list && list.pendingDeleteAll) {
            clearInterval(list.pendingDeleteAll.intervalId);
            list.tasks = list.pendingDeleteAll.tempTasks;
            delete list.pendingDeleteAll;
            render();
            return;
        }
    }
});

listsContainer.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList.contains('task-input')) {
        e.preventDefault();
        const addTaskBtn = e.target.closest('.input-container').querySelector('.add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.click();
        }
    }
});

// --- Carga Inicial ---
function init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    loadLists();
    render();
}

init();
