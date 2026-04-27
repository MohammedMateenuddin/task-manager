document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const taskCategory = document.getElementById('task-category');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const themeToggleBtn = document.getElementById('theme-toggle');

    let tasks = JSON.parse(localStorage.getItem('nextasks')) || [];
    let currentFilter = 'all';

    // Theme setup
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggleBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode);
        themeToggleBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    function saveTasks() {
        localStorage.setItem('nextasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <span class="task-category-badge cat-${task.category}">${task.category}</span>
                </div>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;

            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => toggleTask(task.id));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            taskList.appendChild(li);
        });

        updateStats();
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            const newTask = {
                id: Date.now().toString(),
                text: text,
                category: taskCategory.value,
                completed: false
            };
            tasks.unshift(newTask);
            saveTasks();
            renderTasks();
            taskInput.value = '';
        }
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    function updateStats() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    });

    // Initial render
    renderTasks();
});
