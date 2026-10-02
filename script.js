document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. STATE MANAGEMENT & STORAGE
  // ==========================================
  let tasks = JSON.parse(localStorage.getItem('aura_tasks')) || [];
  let currentFilter = 'all';
  let searchQuery = '';
  
  // Calendar State
  let currentDate = new Date(); // For month navigation
  let selectedDateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // ==========================================
  // 2. DOM ELEMENTS SELECTION
  // ==========================================
  // Welcome Screen & App
  const welcomeScreen = document.getElementById('welcome-screen');
  const enterAppBtn = document.getElementById('enter-app-btn');
  const appContainer = document.getElementById('app-container');
  const currentDateEl = document.getElementById('current-date');

  // Stats Analytics
  const statCompletedEl = document.getElementById('stat-completed-count');
  const statTotalEl = document.getElementById('stat-total-count');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');

  // Task Form Controls
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const categorySelect = document.getElementById('category-select');
  const prioritySelect = document.getElementById('priority-select');

  // Search & Filter Tabs
  const searchInput = document.getElementById('search-input');
  const filterTabs = document.querySelectorAll('.tab-btn');
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');

  // Calendar Modal Elements
  const calendarModal = document.getElementById('calendarModal');
  const openCalendarBtn = document.getElementById('openCalendarBtn');
  const closeCalendarBtn = document.getElementById('closeCalendarBtn');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const currentMonthYear = document.getElementById('currentMonthYear');
  const calendarDays = document.getElementById('calendarDays');

  // Selected Date Panel Elements
  const dateTaskPanel = document.getElementById('dateTaskPanel');
  const selectedDateTitle = document.getElementById('selectedDateTitle');
  const dateTaskInput = document.getElementById('dateTaskInput');
  const addDateTaskBtn = document.getElementById('addDateTaskBtn');
  const dateTaskList = document.getElementById('dateTaskList');

  // ==========================================
  // 3. WELCOME SCREEN & DATE INITIALIZATION
  // ==========================================
  if (enterAppBtn) {
    enterAppBtn.addEventListener('click', () => {
      welcomeScreen.style.opacity = '0';
      welcomeScreen.style.pointerEvents = 'none';
      setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
      }, 300);
    });
  }

  function updateHeaderDate() {
    if (!currentDateEl) return;
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }
  updateHeaderDate();

  // ==========================================
  // 4. STORAGE & SYNC HELPERS
  // ==========================================
  function saveTasks() {
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
    renderCalendar();
    renderMainTasks();
    if (selectedDateStr) {
      renderDatePanelTasks(selectedDateStr);
    }
  }

  // ==========================================
  // 5. CALENDAR MODAL LOGIC
  // ==========================================
  if (openCalendarBtn) {
    openCalendarBtn.addEventListener('click', () => {
      calendarModal.classList.remove('hidden');
      renderCalendar();
    });
  }

  if (closeCalendarBtn) {
    closeCalendarBtn.addEventListener('click', () => {
      calendarModal.classList.add('hidden');
    });
  }

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  function renderCalendar() {
    if (!calendarDays || !currentMonthYear) return;

    calendarDays.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    currentMonthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    // Blank cells for alignment
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.classList.add('day-cell', 'empty');
      calendarDays.appendChild(emptyCell);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dayCell = document.createElement('div');
      dayCell.classList.add('day-cell');
      dayCell.textContent = day;

      const formattedMonth = String(month + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

      if (dateStr === todayStr) dayCell.classList.add('today');
      if (dateStr === selectedDateStr) dayCell.classList.add('active-date');

      // Check if tasks exist for this date
      const hasTasks = tasks.some(t => t.date === dateStr);
      if (hasTasks) dayCell.classList.add('has-tasks');

      dayCell.addEventListener('click', () => {
        document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('active-date'));
        dayCell.classList.add('active-date');
        selectedDateStr = dateStr;

        openDateTaskPanel(dateStr, day, monthNames[month]);
        renderMainTasks();
      });

      calendarDays.appendChild(dayCell);
    }
  }

  // Selected Date Panel inside Calendar Modal
  function openDateTaskPanel(dateStr, day, monthName) {
    if (!dateTaskPanel) return;
    dateTaskPanel.classList.remove('hidden');
    selectedDateTitle.textContent = `Tasks for ${monthName} ${day}`;
    renderDatePanelTasks(dateStr);
  }

  function renderDatePanelTasks(dateStr) {
    if (!dateTaskList) return;
    dateTaskList.innerHTML = '';
    const dateFiltered = tasks.filter(t => t.date === dateStr);

    if (dateFiltered.length === 0) {
      dateTaskList.innerHTML = '<li style="font-size: 0.8rem; color: #718096; padding: 6px;">No tasks scheduled for this date.</li>';
      return;
    }

    dateFiltered.forEach(task => {
      const li = document.createElement('li');
      li.className = `date-task-item ${task.completed ? 'completed' : ''}`;
      li.innerHTML = `
        <span>${escapeHTML(task.text)}</span>
        <div>
          <button onclick="window.appToggleTask('${task.id}')" style="border:none; background:none; cursor:pointer; margin-right:4px;">
            ${task.completed ? '↩️' : '✅'}
          </button>
          <button onclick="window.appDeleteTask('${task.id}')" style="border:none; background:none; cursor:pointer;">
            🗑️
          </button>
        </div>
      `;
      dateTaskList.appendChild(li);
    });
  }

  if (addDateTaskBtn && dateTaskInput) {
    addDateTaskBtn.addEventListener('click', () => {
      const text = dateTaskInput.value.trim();
      if (!text || !selectedDateStr) return;

      addTask(text, 'General', 'Medium', selectedDateStr);
      dateTaskInput.value = '';
    });
  }

  // ==========================================
  // 6. MAIN WORKSPACE TASK CRUD OPERATIONS
  // ==========================================
  function addTask(text, category, priority, targetDate = selectedDateStr) {
    const newTask = {
      id: Date.now().toString(),
      text,
      category,
      priority,
      completed: false,
      date: targetDate,
      createdAt: new Date().toISOString()
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

  // Event Listeners for Main Form
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = taskInput.value.trim();
      if (!text) return;

      addTask(text, categorySelect.value, prioritySelect.value, selectedDateStr);
      taskInput.value = '';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderMainTasks();
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderMainTasks();
    });
  });

  // ==========================================
  // 7. MAIN LIST & ANALYTICS RENDER
  // ==========================================
  function renderMainTasks() {
    if (!taskList) return;
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter tasks for selected calendar date
    let dateFilteredTasks = tasks.filter(task => {
      if (task.date) return task.date === selectedDateStr;
      return selectedDateStr === todayStr; // Backward compatibility
    });

    // Filter by Tab (All/Active/Completed) & Search Query
    let filteredTasks = dateFilteredTasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchQuery);
      if (currentFilter === 'active') return !task.completed && matchesSearch;
      if (currentFilter === 'completed') return task.completed && matchesSearch;
      return matchesSearch;
    });

    // Render DOM List
    taskList.innerHTML = '';
    if (filteredTasks.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
    } else {
      if (emptyState) emptyState.classList.add('hidden');
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;
        taskList.appendChild(li);
      });
    }

    updateStats(dateFilteredTasks);
  }

  function updateStats(dateFilteredTasks) {
    if (!statTotalEl || !statCompletedEl || !progressBarFill || !progressText) return;

    const total = dateFilteredTasks.length;
    const completed = dateFilteredTasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    statTotalEl.textContent = total;
    statCompletedEl.textContent = completed;
    progressBarFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}% tasks completed for selected date`;
  }

  // Global window methods for inline onclick bindings
  window.appToggleTask = (id) => toggleTask(id);
  window.appDeleteTask = (id) => deleteTask(id);

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // ==========================================
  // 8. CELEBRATION EFFECT (CONFETTI)
  // ==========================================
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
      particle.style.zIndex = '10000';
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
  renderCalendar();
  renderMainTasks();
});
