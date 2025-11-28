// Firebase configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBAgFljZIMCDto3Aml8FW4mB2ZA7qsH500",
    authDomain: "sampleappkiro.firebaseapp.com",
    projectId: "sampleappkiro",
    storageBucket: "sampleappkiro.firebasestorage.app",
    messagingSenderId: "132801171282",
    appId: "1:132801171282:web:1e5cc312f18ca90ae6748b",
    databaseURL: "https://sampleappkiro-default-rtdb.europe-west1.firebasedatabase.app"
};

class TodoApp {
    constructor() {
        this.tasks = [];
        this.db = null;
        this.init();
    }

    async init() {
        this.taskInput = document.getElementById('taskInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.addBtn = document.getElementById('addBtn');
        this.personalList = document.getElementById('personalTasks');
        this.workList = document.getElementById('workTasks');

        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        await this.initFirebase();
    }

    async initFirebase() {
        try {
            // Import Firebase
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getDatabase, ref, onValue, set, push } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

            const app = initializeApp(FIREBASE_CONFIG);
            this.db = getDatabase(app);
            this.dbRef = ref;
            this.dbOnValue = onValue;
            this.dbSet = set;
            this.dbPush = push;

            // Listen for changes
            const tasksRef = ref(this.db, 'tasks');
            onValue(tasksRef, (snapshot) => {
                const data = snapshot.val();
                this.tasks = data ? Object.entries(data).map(([id, task]) => ({ ...task, id })) : [];
                this.render();
            });
        } catch (error) {
            console.error('Firebase initialization failed, using localStorage:', error);
            // Fallback to localStorage
            this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            this.render();
        }
    }

    async addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const task = {
            text: text,
            category: this.categorySelect.value,
            completed: false,
            createdAt: new Date().toLocaleDateString()
        };

        this.taskInput.value = '';

        if (this.db) {
            const tasksRef = this.dbRef(this.db, 'tasks');
            const newTaskRef = this.dbPush(tasksRef);
            await this.dbSet(newTaskRef, task);
        } else {
            task.id = Date.now();
            this.tasks.push(task);
            this.saveTasks();
            this.render();
        }
    }

    async toggleTask(id) {
        if (this.db) {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                const taskRef = this.dbRef(this.db, `tasks/${id}`);
                await this.dbSet(taskRef, { ...task, completed: !task.completed });
            }
        } else {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                this.saveTasks();
                this.render();
            }
        }
    }

    async deleteTask(id) {
        if (this.db) {
            const taskRef = this.dbRef(this.db, `tasks/${id}`);
            await this.dbSet(taskRef, null);
        } else {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
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
