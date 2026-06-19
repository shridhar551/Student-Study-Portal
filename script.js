// Local Storage Initialization & Tab Management
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
    renderNotes();
    renderTodos();
    renderAttendance();
    resetTimer();
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ---------------- NOTES MANAGEMENT ----------------
let notes = JSON.parse(localStorage.getItem('portal_notes')) || [];

function addNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    
    if (!title || !content) return alert('Please fill in both fields');

    notes.push({ id: Date.now(), title, content });
    localStorage.setItem('portal_notes', JSON.stringify(notes));
    
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    
    renderNotes();
    updateDashboardStats();
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('portal_notes', JSON.stringify(notes));
    renderNotes();
    updateDashboardStats();
}

function renderNotes() {
    const container = document.getElementById('notes-list');
    container.innerHTML = notes.map(note => `
        <div class="note-card">
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <button class="delete-btn" onclick="deleteNote(${note.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

// ---------------- TO-DO LIST ----------------
let todos = JSON.parse(localStorage.getItem('portal_todos')) || [];

function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (!text) return;

    todos.push({ id: Date.now(), text, completed: false });
    localStorage.setItem('portal_todos', JSON.stringify(todos));
    input.value = '';
    renderTodos();
    updateDashboardStats();
}

function toggleTodo(id) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    localStorage.setItem('portal_todos', JSON.stringify(todos));
    renderTodos();
    updateDashboardStats();
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    localStorage.setItem('portal_todos', JSON.stringify(todos));
    renderTodos();
    updateDashboardStats();
}

function renderTodos() {
    const list = document.getElementById('todo-list');
    list.innerHTML = todos.map(t => `
        <li class="${t.completed ? 'completed' : ''}">
            <span onclick="toggleTodo(${t.id})" style="cursor:pointer;">
                <i class="fa-regular ${t.completed ? 'fa-circle-check' : 'fa-circle'}"></i> ${t.text}
            </span>
            <button class="delete-btn" onclick="deleteTodo(${t.id})"><i class="fa-solid fa-trash"></i></button>
        </li>
    `).join('');
}

// ---------------- ATTENDANCE TRACKER ----------------
let attendance = JSON.parse(localStorage.getItem('portal_attendance')) || [];

function addSubject() {
    const input = document.getElementById('subject-input');
    const name = input.value.trim();
    if (!name) return;

    attendance.push({ id: Date.now(), name, present: 0, total: 0 });
    localStorage.setItem('portal_attendance', JSON.stringify(attendance));
    input.value = '';
    renderAttendance();
}

function markAttendance(id, type) {
    attendance = attendance.map(sub => {
        if (sub.id === id) {
            return {
                ...sub,
                present: type === 'present' ? sub.present + 1 : sub.present,
                total: sub.total + 1
            };
        }
        return sub;
    });
    localStorage.setItem('portal_attendance', JSON.stringify(attendance));
    renderAttendance();
}

function deleteSubject(id) {
    attendance = attendance.filter(sub => sub.id !== id);
    localStorage.setItem('portal_attendance', JSON.stringify(attendance));
    renderAttendance();
}

function renderAttendance() {
    const container = document.getElementById('attendance-list');
    container.innerHTML = attendance.map(sub => {
        const percentage = sub.total === 0 ? 0 : Math.round((sub.present / sub.total) * 100);
        return `
            <div class="attendance-card">
                <button class="delete-btn" onclick="deleteSubject(${sub.id})"><i class="fa-solid fa-trash"></i></button>
                <h3>${sub.name}</h3>
                <div class="attendance-stats">${percentage}%</div>
                <p style="margin-bottom: 10px;">${sub.present} / ${sub.total} Classes</p>
                <div class="attendance-actions">
                    <button class="btn-present" onclick="markAttendance(${sub.id}, 'present')">Present</button>
                    <button class="btn-absent" onclick="markAttendance(${sub.id}, 'absent')">Absent</button>
                </div>
            </div>
        `;
    }).join('');
}

// ---------------- POMODORO TIMER ----------------
let timerInterval;
let timeRemaining = 1500; // 25 mins default
let isRunning = false;
let currentMode = 'work';

const modes = { work: 1500, short: 300, long: 900 };

function setTimerMode(mode) {
    currentMode = mode;
    timeRemaining = modes[mode];
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    pauseTimer();
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const seconds = (timeRemaining % 60).toString().padStart(2, '0');
    const formattedTime = `${minutes}:${seconds}`;
    
    document.getElementById('timer-display').innerText = formattedTime;
    document.getElementById('dash-timer').innerText = formattedTime;
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        isRunning = true;
        document.getElementById('start-btn').innerHTML = `<i class="fa-solid fa-pause"></i> Pause`;
        timerInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                alert("Time's up!");
                resetTimer();
            }
        }, 1000);
    }
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('start-btn').innerHTML = `<i class="fa-solid fa-play"></i> Start`;
}

function resetTimer() {
    pauseTimer();
    timeRemaining = modes[currentMode];
    updateTimerDisplay();
}

// ---------------- DASHBOARD STATS ----------------
function updateDashboardStats() {
    const pendingTodos = todos.filter(t => !t.completed).length;
    document.getElementById('dash-todo-count').innerText = `${pendingTodos} Tasks remaining`;
    document.getElementById('dash-notes-count').innerText = `${notes.length} Notes saved`;
}