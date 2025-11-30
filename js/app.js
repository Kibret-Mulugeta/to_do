// Task Management System
class TodoApp {
    constructor() {
        this.tasks = this.getTasksFromStorage();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.renderTasks();
        this.setupEventListeners();
    }

    // Get tasks from localStorage
    getTasksFromStorage() {
        const tasks = localStorage.getItem('todoTasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    // Save tasks to localStorage
    saveTasksToStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add new task
    addTask(title, description, completed = false) {
        const task = {
            id: this.generateId(),
            title: title.trim(),
            description: description.trim(),
            completed: completed,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasksToStorage();
        this.renderTasks();
        this.showNotification('Task added successfully!', 'success');
    }

    // Edit task
    editTask(id, title, description, completed) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title: title.trim(),
                description: description.trim(),
                completed: completed
            };
            this.saveTasksToStorage();
            this.renderTasks();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    // Delete task
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasksToStorage();
            this.renderTasks();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    // Toggle task completion
    toggleTaskCompletion(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasksToStorage();
            this.renderTasks();
            const status = task.completed ? 'completed' : 'pending';
            this.showNotification(`Task marked as ${status}!`, 'info');
        }
    }

    // Render tasks to the DOM
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');

        if (this.tasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        
        taskList.innerHTML = this.tasks.map(task => `
            <div class="task-item border border-gray-200 rounded-lg p-4 fade-in ${task.completed ? 'task-completed' : 'task-pending'}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                               onchange="todoApp.toggleTaskCompletion('${task.id}')"
                               class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500">
                        <div>
                            <h3 class="task-title font-semibold text-lg ${task.completed ? 'line-through text-green-600' : 'text-gray-800'}">
                                ${this.escapeHtml(task.title)}
                            </h3>
                            <p class="text-sm text-gray-600 mt-1">
                                ${task.description ? this.escapeHtml(task.description.substring(0, 100)) + (task.description.length > 100 ? '...' : '') : 'No description'}
                            </p>
                            <p class="text-xs text-gray-400 mt-1">
                                Created: ${new Date(task.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="todoApp.viewTask('${task.id}')" 
                                class="view-btn bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition duration-200">
                            View
                        </button>
                        <button onclick="todoApp.editTaskForm('${task.id}')" 
                                class="edit-btn bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition duration-200">
                            Edit
                        </button>
                        <button onclick="todoApp.deleteTask('${task.id}')" 
                                class="delete-btn bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition duration-200">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // View task details
    viewTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Title</label>
                        <p class="mt-1 text-lg font-semibold">${this.escapeHtml(task.title)}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <p class="mt-1 text-gray-600 whitespace-pre-wrap">${task.description ? this.escapeHtml(task.description) : 'No description provided'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <span class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${task.completed ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Created Date</label>
                        <p class="mt-1 text-sm text-gray-600">${new Date(task.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            `;
            document.getElementById('viewModal').classList.remove('hidden');
        }
    }

    // Edit task form
    editTaskForm(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            this.currentEditId = id;
            
            // Populate form with task data
            document.getElementById('title').value = task.title;
            document.getElementById('description').value = task.description;
            document.getElementById('completed').checked = task.completed;
            
            // Change form to edit mode
            const form = document.getElementById('taskForm');
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Update Task';
            submitButton.className = 'w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200';
            
            // Scroll to form
            form.scrollIntoView({ behavior: 'smooth' });
            document.getElementById('title').focus();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        const form = document.getElementById('taskForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const completed = document.getElementById('completed').checked;

            if (!title.trim()) {
                this.showNotification('Please enter a task title!', 'error');
                return;
            }

            if (this.currentEditId) {
                this.editTask(this.currentEditId, title, description, completed);
                this.resetForm();
            } else {
                this.addTask(title, description, completed);
                form.reset();
            }
        });

        // Close modal when clicking outside
        document.getElementById('viewModal').addEventListener('click', (e) => {
            if (e.target.id === 'viewModal') {
                this.closeViewModal();
            }
        });
    }

    // Reset form to add mode
    resetForm() {
        const form = document.getElementById('taskForm');
        const submitButton = form.querySelector('button[type="submit"]');
        
        form.reset();
        submitButton.textContent = 'Add Task';
        submitButton.className = 'w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200';
        this.currentEditId = null;
    }

    // Close view modal
    closeViewModal() {
        document.getElementById('viewModal').classList.add('hidden');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        notification.className = `notification fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 slide-in`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Escape HTML to prevent XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// Global functions for HTML event handlers
function closeViewModal() {
    if (todoApp) {
        todoApp.closeViewModal();
    }
}