// Task Management System
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        console.log('TodoApp initializing...');
        try {
            this.tasks = this.getTasksFromStorage();
            this.renderTasks();
            this.setupEventListeners();
            console.log('TodoApp initialized successfully with', this.tasks.length, 'tasks');
        } catch (error) {
            console.error('Error initializing TodoApp:', error);
            this.showError('Failed to initialize application');
        }
    }

    // Get tasks from localStorage
    getTasksFromStorage() {
        try {
            const tasks = localStorage.getItem('todoTasks');
            if (tasks) {
                return JSON.parse(tasks);
            }
            return [];
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
            return [];
        }
    }

    // Save tasks to localStorage
    saveTasksToStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
            this.showError('Failed to save tasks');
        }
    }

    // Generate unique ID
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Add new task
    addTask(title, description, completed = false) {
        try {
            if (!title || !title.trim()) {
                this.showNotification('Please enter a task title!', 'error');
                return false;
            }

            const task = {
                id: this.generateId(),
                title: title.trim(),
                description: description ? description.trim() : '',
                completed: completed,
                createdAt: new Date().toISOString()
            };

            this.tasks.unshift(task);
            this.saveTasksToStorage();
            this.renderTasks();
            this.showNotification('Task added successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error adding task:', error);
            this.showError('Failed to add task');
            return false;
        }
    }

    // Edit task
    editTask(id, title, description, completed) {
        try {
            const taskIndex = this.tasks.findIndex(task => task.id === id);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = {
                    ...this.tasks[taskIndex],
                    title: title.trim(),
                    description: description ? description.trim() : '',
                    completed: completed
                };
                this.saveTasksToStorage();
                this.renderTasks();
                this.showNotification('Task updated successfully!', 'success');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error editing task:', error);
            this.showError('Failed to edit task');
            return false;
        }
    }

    // Delete task
    deleteTask(id) {
        try {
            if (confirm('Are you sure you want to delete this task?')) {
                this.tasks = this.tasks.filter(task => task.id !== id);
                this.saveTasksToStorage();
                this.renderTasks();
                this.showNotification('Task deleted successfully!', 'success');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showError('Failed to delete task');
            return false;
        }
    }

    // Toggle task completion
    toggleTaskCompletion(id) {
        try {
            const task = this.tasks.find(task => task.id === id);
            if (task) {
                task.completed = !task.completed;
                this.saveTasksToStorage();
                this.renderTasks();
                const status = task.completed ? 'completed' : 'pending';
                this.showNotification(`Task marked as ${status}!`, 'info');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error toggling task completion:', error);
            this.showError('Failed to update task status');
            return false;
        }
    }

    // Render tasks to the DOM
    renderTasks() {
        try {
            const taskList = document.getElementById('taskList');
            const emptyState = document.getElementById('emptyState');

            if (!taskList || !emptyState) {
                console.error('Required DOM elements not found');
                return;
            }

            if (this.tasks.length === 0) {
                taskList.innerHTML = '';
                emptyState.classList.remove('hidden');
                this.hideError();
                return;
            }

            emptyState.classList.add('hidden');
            this.hideError();
            
            const tasksHTML = this.tasks.map(task => {
                const descriptionPreview = task.description 
                    ? (task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description)
                    : 'No description';
                
                return `
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
                                    ${this.escapeHtml(descriptionPreview)}
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
                `;
            }).join('');

            taskList.innerHTML = tasksHTML;
        } catch (error) {
            console.error('Error rendering tasks:', error);
            this.showError('Failed to display tasks');
        }
    }

    // View task details
    viewTask(id) {
        try {
            const task = this.tasks.find(task => task.id === id);
            if (task) {
                const modalContent = document.getElementById('modalContent');
                const viewModal = document.getElementById('viewModal');
                if (modalContent && viewModal) {
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
                    viewModal.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Error viewing task:', error);
            this.showError('Failed to view task details');
        }
    }

    // Edit task form
    editTaskForm(id) {
        try {
            const task = this.tasks.find(task => task.id === id);
            if (task) {
                this.currentEditId = id;
                
                const titleInput = document.getElementById('title');
                const descriptionInput = document.getElementById('description');
                const completedInput = document.getElementById('completed');
                
                if (titleInput && descriptionInput && completedInput) {
                    titleInput.value = task.title;
                    descriptionInput.value = task.description || '';
                    completedInput.checked = task.completed;
                    
                    const form = document.getElementById('taskForm');
                    const submitButton = form.querySelector('button[type="submit"]');
                    submitButton.textContent = 'Update Task';
                    submitButton.className = 'w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200';
                    
                    form.scrollIntoView({ behavior: 'smooth' });
                    titleInput.focus();
                }
            }
        } catch (error) {
            console.error('Error loading edit form:', error);
            this.showError('Failed to load edit form');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        try {
            const form = document.getElementById('taskForm');
            if (!form) {
                console.error('Task form not found');
                return;
            }
            
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const title = document.getElementById('title')?.value || '';
                const description = document.getElementById('description')?.value || '';
                const completed = document.getElementById('completed')?.checked || false;

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
            const viewModal = document.getElementById('viewModal');
            if (viewModal) {
                viewModal.addEventListener('click', (e) => {
                    if (e.target.id === 'viewModal') {
                        this.closeViewModal();
                    }
                });
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            this.showError('Failed to initialize application controls');
        }
    }

    // Reset form to add mode
    resetForm() {
        try {
            const form = document.getElementById('taskForm');
            const submitButton = form?.querySelector('button[type="submit"]');
            
            if (form && submitButton) {
                form.reset();
                submitButton.textContent = 'Add Task';
                submitButton.className = 'w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200';
                this.currentEditId = null;
            }
        } catch (error) {
            console.error('Error resetting form:', error);
        }
    }

    // Close view modal
    closeViewModal() {
        try {
            const viewModal = document.getElementById('viewModal');
            if (viewModal) {
                viewModal.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        try {
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
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    // Show error message
    showError(message) {
        try {
            const errorDiv = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            if (errorDiv && errorText) {
                errorText.textContent = message;
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error displaying error message:', error);
        }
    }

    // Hide error message
    hideError() {
        try {
            const errorDiv = document.getElementById('errorMessage');
            if (errorDiv) {
                errorDiv.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error hiding error message:', error);
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
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
    console.log('DOM loaded, initializing TodoApp...');
    try {
        todoApp = new TodoApp();
    } catch (error) {
        console.error('Failed to initialize TodoApp:', error);
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        if (errorDiv && errorText) {
            errorText.textContent = 'Failed to load application. Please refresh the page.';
            errorDiv.classList.remove('hidden');
        }
    }
});

// Global functions for HTML event handlers
function closeViewModal() {
    if (todoApp) {
        todoApp.closeViewModal();
    }
}