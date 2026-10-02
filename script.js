document.addEventListener('DOMContentLoaded', () => {

  // DOM Elements
  const todoForm = document.getElementById('todoForm');
  const todoInput = document.getElementById('todoInput');
  const todoList = document.getElementById('todoList');
  const emptyState = document.getElementById('emptyState');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');

  // Application State
  let tasks = JSON.parse(localStorage.getItem('aura_tasks')) || [];
  let currentFilter = 'all';

  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
  }

  // Render Tasks according to filter & update progress
  function renderTasks() {
    todoList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    });

    if (filteredTasks.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';

      filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
          <div class="todo-content">
            <div class="custom-checkbox">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span class="task-text">${escapeHtml(task.text)}</span>
          </div>
          <button class="btn-delete" aria-label="Delete task">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        `;

        todoList.appendChild(li);
      });
    }

    updateProgress();
  }

  // Update Task Progress Counter
  function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressText.textContent = `${completed} of ${total} completed`;
    progressBar.style.width = `${percentage}%`;
  }

  // Add Task
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();

    if (text !== '') {
      const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false
      };

      tasks.unshift(newTask);
      saveTasks();
      renderTasks();
      todoInput.value = '';
    }
  });

  // Event Delegation for Task Completion Toggle & Deletion
  todoList.addEventListener('click', (e) => {
    const item = e.target.closest('.todo-item');
    if (!item) return;

    const taskId = item.dataset.id;

    // Delete Button Clicked
    if (e.target.closest('.btn-delete')) {
      tasks = tasks.filter(t => t.id !== taskId);
      saveTasks();
      renderTasks();
      return;
    }

    // Toggle Task Complete (Clicking checkbox or row)
    tasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    saveTasks();
    renderTasks();
  });

  // Filter Buttons Handler
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Clear Completed Tasks
  clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
  });

  // Helper function to sanitize user input
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initial Render
  renderTasks();
});
                          
