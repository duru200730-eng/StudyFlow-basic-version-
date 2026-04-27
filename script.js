// ============================================
// StudyFlow - Modern Student Dashboard
// COMPLETE & ERROR-FREE JavaScript
// ============================================

class StudyFlowApp {
  constructor() {
    this.subjects = JSON.parse(localStorage.getItem('studyflow-subjects')) || [];
    this.todos = JSON.parse(localStorage.getItem('studyflow-todos')) || [];
    this.selectedSubjectId = null;
    this.particles = [];
    this.init();
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  init() {
    this.cacheElements();
    this.setupParticles();
    this.setRandomQuote();
    this.renderAll();
    this.bindEvents();
    this.updateCounts();
    this.animateEntrance();
    this.startAutoSave();
  }

  cacheElements() {
    this.elements = {
      sidebar: document.getElementById('sidebar'),
      overlay: document.getElementById('sidebar-overlay'),
      toggleBtn: document.getElementById('toggle-sidebar'),
      navBtns: document.querySelectorAll('.nav-btn'),
      subjectsGrid: document.getElementById('subjects-grid'),
      subjectsList: document.getElementById('subjects-list'),
      todosList: document.getElementById('todos-list'),
      todayTasks: document.getElementById('today-tasks'),
      modal: document.getElementById('subject-detail-modal'),
      quote: document.getElementById('quote'),
      overloadWarning: document.getElementById('overload-warning'),
      newSubjectInput: document.getElementById('new-subject-name'),
      newTodoInput: document.getElementById('new-todo'),
      subjectNotes: document.getElementById('subject-notes'),
      todayCount: document.getElementById('today-count'),
      urgentCount: document.getElementById('urgent-count'),
      subjectsCount: document.getElementById('subjects-count'),
      todosCount: document.getElementById('todos-count'),
      modalTaskCount: document.getElementById('modal-task-count'),
      subjectsCountText: document.getElementById('subjects-count-text'),
      todoCount: document.getElementById('todo-count')
    };
  }

  setupParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  setRandomQuote() {
    const quotes = [
      "The beautiful thing about learning is that nobody can take it away from you. – B.B. King",
      "Success is the sum of small efforts repeated day in and day out. – Robert Collier",
      "You don't have to be great to start, but you have to start to be great. – Zig Ziglar",
      "The expert in anything was once a beginner. – Helen Hayes",
      "Learning is a treasure that will follow its owner everywhere. – Chinese Proverb",
      "An investment in knowledge pays the best interest. – Benjamin Franklin",
      "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. – Brian Herbert"
    ];
    this.elements.quote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  }

  getRandomColor() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getRandomEmoji() {
    const emojis = ['📚', '✏️', '📖', '🧮', '🎓', '🔬', '🖥️', '🎨', '📊', '💡'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  getSubjectById(id) {
    return this.subjects.find(s => s.id === id);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    });
  }

  timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diff = now - past;
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  debounce(func, wait) {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  bindEvents() {
    this.elements.navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.showPage(e.currentTarget.dataset.page));
    });

    this.elements.toggleBtn.addEventListener('click', () => this.toggleMobileSidebar());
    this.elements.overlay.addEventListener('click', () => this.closeMobileSidebar());

    this.elements.newSubjectInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addSubject();
    });
    this.elements.newTodoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeSubjectModal();
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.saveData();
      }
    });

    this.elements.subjectNotes.addEventListener('input', this.debounce(() => this.saveNotes(), 800));
  }

  showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetPage = document.getElementById(pageId + '-page');
    const activeBtn = document.querySelector(`[data-page="${pageId}"]`);

    if (targetPage) targetPage.classList.remove('hidden');
    if (activeBtn) activeBtn.classList.add('active');

    switch(pageId) {
      case 'dashboard': this.updateDashboard(); break;
      case 'subjects': this.renderSubjectsGrid(); break;
      case 'todos': this.renderTodos(); break;
    }
    this.closeMobileSidebar();
  }

  toggleMobileSidebar() {
    this.elements.sidebar.classList.toggle('open');
    this.elements.overlay.classList.toggle('hidden');
  }

  closeMobileSidebar() {
    this.elements.sidebar.classList.remove('open');
    this.elements.overlay.classList.add('hidden');
  }

  saveData() {
    localStorage.setItem('studyflow-subjects', JSON.stringify(this.subjects));
    localStorage.setItem('studyflow-todos', JSON.stringify(this.todos));
  }

  startAutoSave() {
    setInterval(() => this.saveData(), 30000);
  }

  saveNotes() {
    if (this.selectedSubjectId) {
      const subject = this.getSubjectById(this.selectedSubjectId);
      if (subject) {
        subject.notes = this.elements.subjectNotes.value;
        this.saveData();
      }
    }
  }

  addSubject() {
    const name = this.elements.newSubjectInput.value.trim();
    if (!name) return;

    const newSubject = {
      id: this.uuidv4(),
      name,
      color: this.getRandomColor(),
      emoji: this.getRandomEmoji(),
      notes: '',
      tasks: [],
      createdAt: new Date().toISOString(),
      stats: { totalTasks: 0, completedTasks: 0 }
    };

    this.subjects.unshift(newSubject);
    this.saveData();
    this.renderSubjectsGrid();
    this.renderSubjectsList();
    this.updateCounts();
    this.elements.newSubjectInput.value = '';
  }

  deleteSubject(id) {
    if (confirm(`Delete "${this.getSubjectById(id)?.name}"?
All tasks and notes will be permanently lost.`)) {
      this.subjects = this.subjects.filter(s => s.id !== id);
      this.saveData();
      this.renderSubjectsGrid();
      this.renderSubjectsList();
      this.updateCounts();
      if (this.selectedSubjectId === id) this.closeSubjectModal();
    }
  }

  openSubjectModal(id) {
    this.selectedSubjectId = id;
    const subject = this.getSubjectById(id);
    if (!subject) return;

    document.getElementById('modal-subject-icon').innerHTML = 
      `<div class="w-full h-full rounded-3xl flex items-center justify-center text-3xl font-bold" style="background: ${subject.color}; color: white;">${subject.emoji}</div>`;
    document.getElementById('modal-subject-name').textContent = subject.name;
    document.getElementById('subject-notes').value = subject.notes || '';
    
    this.renderModalTasks();
    this.updateModalTaskCount();
    
    this.elements.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('subject-notes').focus();
  }

  closeSubjectModal() {
    this.selectedSubjectId = null;
    this.elements.modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  addTaskToModal() {
    const subject = this.getSubjectById(this.selectedSubjectId);
    if (!subject) return;

    const taskId = this.uuidv4();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const task = {
      id: taskId,
      title: `New Task ${subject.tasks.length + 1}`,
      dueDate: tomorrow.toISOString().split('T')[0],
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString()
    };

    subject.tasks.push(task);
    this.saveData();
    this.renderModalTasks();
    this.updateModalTaskCount();
    this.updateDashboard();
  }

  toggleTaskStatus(taskId) {
    const subject = this.getSubjectById(this.selectedSubjectId);
    if (!subject) return;

    const task = subject.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveData();
      this.renderModalTasks();
      this.updateModalTaskCount();
      this.updateDashboard();
    }
  }

  deleteTask(taskId) {
    const subject = this.getSubjectById(this.selectedSubjectId);
    if (!subject) return;

    subject.tasks = subject.tasks.filter(t => t.id !== taskId);
    this.saveData();
    this.renderModalTasks();
    this.updateModalTaskCount();
    this.updateDashboard();
  }

  addTodo() {
    const text = this.elements.newTodoInput.value.trim();
    if (!text) return;

    const todo = {
      id: this.uuidv4(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(todo);
    this.saveData();
    this.renderTodos();
    this.updateCounts();
    this.elements.newTodoInput.value = '';
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveData();
      this.renderTodos();
      this.updateCounts();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveData();
    this.renderTodos();
    this.updateCounts();
  }

  renderAll() {
    this.renderSubjectsGrid();
    this.renderSubjectsList();
    this.renderTodos();
  }

  createSubjectCard(subject) {
    const pendingTasks = subject.tasks?.filter(t => !t.completed).length || 0;
    const totalTasks = subject.tasks?.length || 0;
    const progress = totalTasks ? Math.round((pendingTasks / totalTasks) * 100) : 0;

    return `
      <div class="glass p-8 rounded-3xl hover-lift cursor-pointer group" onclick="app.openSubjectModal('${subject.id}')">
        <div class="flex items-start justify-between mb-6">
          <div class="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold shrink-0 shadow-2xl" style="background: ${subject.color}; color: white;">
            ${subject.emoji}
          </div>
          <div class="flex items-center space-x-3">
            <span class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl text-white font-semibold text-sm">${pendingTasks}/${totalTasks}</span>
            <button onclick="event.stopPropagation(); app.deleteSubject('${subject.id}')" class="p-3 rounded-2xl bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-100 transition-all group-hover:scale-110">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-white mb-4 truncate">${subject.name}</h3>
        <div class="w-full bg-white/10 rounded-full h-2 mb-6">
          <div class="bg-gradient-to-r from-emerald-400 to-blue-400 h-2 rounded-full transition-all" style="width: ${100 - progress}%"></div>
        </div>
        <div class="text-sm text-gray-400">${this.timeAgo(subject.createdAt)}</div>
      </div>
    `;
  }

  renderSubjectsGrid() {
    this.elements.subjectsGrid.innerHTML = this.subjects.length ? 
      this.subjects.map(subject => this.createSubjectCard(subject)).join('') :
      '<div class="text-center py-24 text-gray-500"><div class="text-8xl mb-8 opacity-30">📚</div><h3 class="text-2xl font-bold mb-4 text-white/60">No subjects yet</h3><p class="text-lg">Add your first subject to get organized!</p></div>';
    
    if (this.elements.subjectsCountText) {
      this.elements.subjectsCountText.textContent = `${this.subjects.length} subjects organized`;
    }
  }

  renderSubjectsList() {
    const recentSubjects = this.subjects.slice(0, 5);
    this.elements.subjectsList.innerHTML = recentSubjects.length ? 
      recentSubjects.map(subject => {
        const pending = subject.tasks?.filter(t => !t.completed).length || 0;
        return `
          <div class="glass p-4 rounded-2xl cursor-pointer hover-lift flex items-center space-x-4 group transition-all" onclick="app.openSubjectModal('${subject.id}')">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0" style="background: ${subject.color}; color: white;">
              ${subject.emoji}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-white truncate">${subject.name}</div>
              <div class="text-xs text-gray-400">${pending} pending tasks</div>
            </div>
            <div class="w-6 h-6 rounded-full bg-white/20 group-hover:bg-white/40 transition-all flex items-center justify-center">
              <i class="fas fa-chevron-right text-white/50 text-xs"></i>
            </div>
          </div>
        `;
      }).join('') :
      '<div class="text-gray-500 text-sm py-8 text-center w-full">No subjects yet. Add some from Subjects page!</div>';
  }

  renderTodos() {
    this.elements.todosList.innerHTML = this.todos.length ? 
      this.todos.map(todo => `
        <div class="task-item glass p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div class="flex items-center flex-1">
            <button onclick="app.toggleTodo('${todo.id}')" class="w-10 h-10 rounded-2xl flex items-center justify-center mr-5 transition-all ${todo.completed ? 'bg-emerald-500 shadow-lg' : 'bg-white/20 hover:bg-white/40'} text-white">
              ${todo.completed ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'}
            </button>
            <div class="flex-1">
              <div class="text-white font-semibold ${todo.completed ? 'line-through opacity-70' : ''}">${todo.text}</div>
              <div class="text-xs text-gray-500 mt-1">${this.timeAgo(todo.createdAt)}</div>
            </div>
          </div>
          <button onclick="app.deleteTodo('${todo.id}')" class="p-3 rounded-2xl bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-100 transition-all">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('') :
      '<div class="text-center py-20 text-gray-500"><i class="fas fa-clipboard-list text-6xl mb-6 opacity-50"></i><p class="text-xl">Your to-do list is empty!<br>Add your first task 🎉</p></div>';
    
    if (this.elements.todoCount) {
      this.elements.todoCount.textContent = `${this.todos.length} items`;
    }
  }

  renderModalTasks() {
    const subject = this.getSubjectById(this.selectedSubjectId);
    if (!subject) return;

    const tasksList = document.getElementById('modal-tasks-list');
    if (!tasksList) return;

    tasksList.innerHTML = subject.tasks.length ? 
      subject.tasks.map(task => {
        const isOverdue = new Date(task.dueDate) < new Date();
        const isDueSoon = !isOverdue && new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        const badgeClass = isOverdue ? 'bg-red-500/30 text-red-300 border-red-400/50' : 
                          isDueSoon ? 'bg-orange-500/30 text-orange-300 border-orange-400/50' : 
                          'bg-emerald-500/30 text-emerald-300 border-emerald-400/50';
        const badgeText = isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'On Track';

        return `
          <div class="task-item glass p-6 rounded-2xl flex items-center justify-between hover-lift group">
            <div class="flex items-center flex-1">
              <button onclick="app.toggleTaskStatus('${task.id}')" class="w-10 h-10 rounded-2xl flex items-center justify-center mr-5 transition-all ${task.completed ? 'bg-emerald-500 shadow-lg' : 'bg-white/20 hover:bg-white/40'} text-white shadow-md">
                ${task.completed ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'}
              </button>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3 mb-2">
                  <h4 class="font-semibold text-white text-lg truncate ${task.completed ? 'line-through opacity-70' : ''}">${task.title}</h4>
                  <span class="status-badge px-4 py-2 rounded-xl text-sm font-bold border ${badgeClass}">${badgeText}</span>
                </div>
                <div class="flex items-center space-x-6 text-sm text-gray-400">
                  <span><i class="fas fa-calendar-day mr-2"></i>${this.formatDate(task.dueDate)}</span>
                  <span><i class="fas fa-clock mr-2"></i>${this.timeAgo(task.createdAt)}</span>
                </div>
              </div>
            </div>
            <button onclick="app.deleteTask('${task.id}')" class="p-3 rounded-2xl bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-100 transition-all group-hover:scale-110">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
      }).join('') :
      '<div class="text-center py-16 text-gray-500"><i class="fas fa-tasks text-5xl mb-6 opacity-50"></i><p class="text-xl">No tasks yet<br><button onclick="app.addTaskToModal()" class="mt-4 px-6 py-3 gradient-4 text-white rounded-xl font-semibold hover:shadow-xl transition-all">+ Add First Task</button></div>';
  }

  updateCounts() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasksCount = this.subjects.reduce((count, subject) => {
      return count + (subject.tasks?.filter(task => task.dueDate === today && !task.completed).length || 0);
    }, 0);
    
    const urgentTasksCount = this.subjects.reduce((count, subject) => {
      return count + (subject.tasks?.filter(task => {
        const dueDate = new Date(task.dueDate);
        return (dueDate < new Date() || dueDate <= new Date(Date.now() + 24 * 60 * 60 * 1000)) && !task.completed;
      }).length || 0);
    }, 0);
    
    const subjectsCount = this.subjects.length;
    const todosCount = this.todos.filter(todo => !todo.completed).length;

    if (this.elements.todayCount) this.elements.todayCount.textContent = todayTasksCount;
    if (this.elements.urgentCount) this.elements.urgentCount.textContent = urgentTasksCount;
    if (this.elements.subjectsCount) this.elements.subjectsCount.textContent = subjectsCount;
    if (this.elements.todosCount) this.elements.todosCount.textContent = todosCount;
  }

  updateTodayTasks() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = [];

    this.subjects.forEach(subject => {
      subject.tasks?.forEach(task => {
        if (task.dueDate === today && !task.completed) {
          todayTasks.push({ ...task, subject });
        }
      });
    });

    // ✅ FIXED: Complete template literal with proper closing
    this.elements.todayTasks.innerHTML = todayTasks.length ? 
      todayTasks.map(task => `
        <div class="glass p-6 rounded-2xl flex items-center justify-between hover-lift group">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mr-4 shrink-0" style="background: ${task.subject.color}; color: white;">
              ${task.subject.emoji}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-white mb-1 truncate">${task.title}</h4>
              <div class="flex items-center space-x-4 text-sm text-gray-400">
                <span class="font-medium">${task.subject.name}</span>
                <span>• ${this.formatDate(task.dueDate)}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
            <span class="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-xl font-medium">Today</span>
          </div>
        </div>
      `).join('') :
      '<div class="text-center py-16 text-gray-500"><i class="fas fa-calendar-check text-5xl mb-6 opacity-50"></i><p class="text-xl">Great job! No tasks due today 🎉</p></div>';
  }

  updateModalTaskCount() {
    const subject = this.getSubjectById(this.selectedSubjectId);
    if (subject && this.elements.modalTaskCount) {
      const pending = subject.tasks.filter(t => !t.completed).length;
      const total = subject.tasks.length;
      this.elements.modalTaskCount.textContent = `${pending}/${total} tasks`;
    }
  }

  updateDashboard() {
    this.updateTodayTasks();
    this.checkOverload();
    this.updateCounts();
  }

  checkOverload() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = this.subjects.reduce((count, subject) => {
     return  count + (subject.tasks?.filter(task => task.dueDate === today && !task.completed).length || 0);
    }, 0);

    if (todayTasks > 5) {
      this.elements.overloadWarning.classList.remove('hidden');
    } else {
      this.elements.overloadWarning.classList.add('hidden');
    }
  }

  animateEntrance() {
    document.querySelectorAll('.glass').forEach((el, index) => {
      el.style.animationDelay = `${index * 0.1}s`;
      el.classList.add('fade-in');
    });
  }
}

// Global app instance
const app = new StudyFlowApp();

// Global functions for onclick handlers
function addSubject() { app.addSubject(); }
function addTodo() { app.addTodo(); }
function addTaskToModal() { app.addTaskToModal(); }
function closeSubjectModal() { app.closeSubjectModal(); }
function deleteSubjectFromModal() { if (app.selectedSubjectId) app.deleteSubject(app.selectedSubjectId); }