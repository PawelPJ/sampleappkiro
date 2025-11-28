class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.init();
    }

    init() {
        this.taskInput = document.getElementById('taskInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.addBtn = document.getElementById('addBtn');
        this.personalList = document.getElementById('personalTasks');
        this.workList = document.getElementById('workTasks');

        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.render();
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: Date.now(),
            text: text,
            category: this.categorySelect.value,
            completed: false,
            createdAt: new Date().toLocaleDateString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    render() {
        this.personalList.innerHTML = '';
        this.workList.innerHTML = '';

        const personalTasks = this.tasks.filter(t => t.category === 'personal');
        const workTasks = this.tasks.filter(t => t.category === 'work');

        this.renderCategory(personalTasks, this.personalList);
        this.renderCategory(workTasks, this.workList);
    }

    renderCategory(tasks, listElement) {
        const activeTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);
        const sortedTasks = [...activeTasks, ...completedTasks];

        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-date">${task.createdAt}</div>
                </div>
                <button class="delete-btn">Delete</button>
            `;

            li.querySelector('.task-checkbox').addEventListener('change', () => {
                this.toggleTask(task.id);
            });

            li.querySelector('.delete-btn').addEventListener('click', () => {
                this.deleteTask(task.id);
            });

            listElement.appendChild(li);
        });
    }
}

new TodoApp();
