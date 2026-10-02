document.addEventListener('DOMContentLoaded', () => {

  // State Management
  let tasks = JSON.parse(localStorage.getItem('aura_tasks')) || [];
  let currentFilter = 'all';
  let searchQuery = '';

  // DOM Elements
  const welcomeScreen = document.getElementById('welcome-screen');
  const enterAppBtn = document.getElementById('enter-app-btn');
  const appContainer = document.getElementById('app-container');
  
  const currentDateEl = document.getElementById('current-date');
  const statCompletedEl = document.getElementById('stat-completed-count');
  const statTotalEl = document.getElementById('stat-total-count');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');

  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const categorySelect = document.getElementById('category-select');
  const prioritySelect = document.getElementById('priority-select');

  const searchInput = document.getElementById('search-input');
  const filterTabs = document.querySelectorAll('.tab-btn');
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');

  /* ==========================================================================
     1. Welcome Screen Transition & Date Initialization
     ========================================================================== */
  enterAppBtn.addEventListener('click', () => {
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.pointerEvents = 'none';
    setTimeout(() => {
      welcomeScreen.classList.add('hidden');
      appContainer.classList.remove('hidden');
    }, 300);
  });

  function updateDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }
  updateDate();

  /* ==========================================================================
     2. Task CRUD Operations
     ========================================================================== */
  function saveTasks() {
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
    render();
  }

  function addTask(text, category, priority) {
    const newTask = {
      id: Date.now().toString(),
      text,
      category,
      priority,
      completed: false,
      createdAt: new Date()
    };
    tasks.unshift(newTask);
    saveTasks();
  }

  function toggleTask(id) {
    tasks = tasks.map(task => {
      if (task.id === id) {
        const isNowCompleted = !task.completed;
        if (isNowCompleted) triggerConfetti();
        return { ...task, completed: isNowCompleted };
      }
      return task;
    });
    saveTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
  }

  /* ==========================================================================
     3. Rendering & Event Listeners
     ========================================================================== */
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    addTask(text, categorySelect.value, prioritySelect.value);
    taskInput.value = '';
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    render();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      render();
    });
  });

  function render() {
    // 1. Filter Tasks
    let filteredTasks = tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchQuery);
      if (currentFilter === 'active') return !task.completed && matchesSearch;
      if (currentFilter === 'completed') return task.completed && matchesSearch;
      return matchesSearch;
    });

    // 2. Render List
    taskList.innerHTML = '';
    if (filteredTasks.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item glass-panel ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
          <div class="task-left">
            <div class="custom-checkbox" onclick="window.appToggleTask('${task.id}')"></div>
            <div class="task-content">
              <span class="task-text">${escapeHTML(task.text)}</span>
              <div class="task-tags">
                <span class="tag-badge">${task.category}</span>
                <span class="priority-badge ${task.priority}">${task.priority}</span>
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-icon" onclick="window.appDeleteTask('${task.id}')" title="Delete Task">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        `;
        taskList.appendChild(li);
      });
    }

    // 3. Update Metrics
    updateStats();
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    statTotalEl.textContent = total;
    statCompletedEl.textContent = completed;
    progressBarFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}% tasks completed today`;
  }

  // Global window helpers for inline onclick handlers
  window.appToggleTask = (id) => toggleTask(id);
  window.appDeleteTask = (id) => deleteTask(id);

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  /* ==========================================================================
     4. Mini Celebration Effects
     ========================================================================== */
  function triggerConfetti() {
    const colors = ['#6BB1AD', '#A7BCBD', '#E5A9A9', '#E6748E'];
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = '-10px';
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = '50%';
      particle.style.zIndex = '1000';
      particle.style.transition = 'transform 1.5s ease-out, opacity 1.5s ease-out';
      document.body.appendChild(particle);

      setTimeout(() => {
        particle.style.transform = `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`;
        particle.style.opacity = '0';
      }, 50);

      setTimeout(() => particle.remove(), 1600);
    }
  }

  // Initial Load
  render();
});
  
