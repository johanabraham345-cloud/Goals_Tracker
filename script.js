const goalsContainer = document.getElementById('goalsContainer');
const goalForm = document.getElementById('goalForm');
const progressRing = document.getElementById('globalProgressRing');
const globalPercentText = document.getElementById('globalPercent');
const currentDayText = document.getElementById('currentDay');
const motivationDisplay = document.getElementById('motivationText');

const motivations = [
    "Execution is everything.", "Precision beats speed. Focus.", "Make it happen, no excuses.",
    "Stay hungry. Stay focused.", "Small wins lead to massive results.", "Consistency is the only bridge.",
    "Win the morning, win the day.", "Be obsessed or be average.", "One task at a time.",
    "Results don't lie.", "Eyes on the prize.", "Act as if failure is impossible.",
    "Progress over perfection.", "Focus is a superpower.", "Don't wish for it, work for it."
];

let state = JSON.parse(localStorage.getItem('goals_tracker_v7')) || {
    date: new Date().toLocaleDateString(),
    tasks: []
};

function init() {
    checkDailyReset();
    setMotivation();
    render();
}

function setMotivation() {
    const randomIdx = Math.floor(Math.random() * motivations.length);
    motivationDisplay.innerText = `"${motivations[randomIdx]}"`;
}

function checkDailyReset() {
    const today = new Date().toLocaleDateString();
    if (state.date !== today) {
        state.tasks.forEach(t => t.current = 0);
        state.date = today;
        save();
    }
}

function formatTime(mins) {
    if (mins < 60) return `${mins}m`;
    return `${(mins / 60).toFixed(1)}h`;
}

function save() {
    localStorage.setItem('goals_tracker_v7', JSON.stringify(state));
    render();
}

function render() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    currentDayText.innerText = new Date().toLocaleDateString('en-US', options);

    goalsContainer.innerHTML = '';
    let totalProgress = 0;

    state.tasks.forEach((task) => {
        const isDone = task.current >= task.target;
        const percent = Math.min((task.current / task.target) * 100, 100);
        totalProgress += percent;

        const div = document.createElement('div');
        div.className = `task-block flex flex-col justify-between ${isDone ? 'task-done' : ''}`;
        
        div.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <button onclick="toggleQuickFinish('${task.id}')" class="w-7 h-7 rounded-lg border-2 border-zinc-800 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'hover:border-blue-500'}">
                    ${isDone ? '<i data-lucide="check" class="w-4 h-4 text-black stroke-[4]"></i>' : ''}
                </button>
                <button onclick="deleteTask('${task.id}')" class="text-zinc-800 hover:text-red-500 transition-colors">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="mb-4">
                <h3 class="text-sm font-bold text-white tracking-tight mb-1 truncate">${task.name}</h3>
                <p class="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                    ${formatTime(task.current)} / ${formatTime(task.target)}
                </p>
            </div>

            <div class="flex items-center gap-3">
                <input type="number" value="${task.current}" 
                    onchange="manualUpdate('${task.id}', this.value)"
                    class="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-xs font-bold text-white outline-none focus:border-blue-500/50">
            </div>

            <div class="progress-track">
                <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
        `;
        goalsContainer.appendChild(div);
    });

    const avgProgress = state.tasks.length ? Math.round(totalProgress / state.tasks.length) : 0;
    // Circumference for r=50 is 314.15
    const offset = 314.15 - (314.15 * avgProgress) / 100;
    progressRing.style.strokeDashoffset = offset;
    globalPercentText.innerText = `${avgProgress}%`;

    lucide.createIcons();
}

goalForm.onsubmit = (e) => {
    e.preventDefault();
    const newTask = {
        id: crypto.randomUUID(),
        name: document.getElementById('goalName').value,
        target: parseInt(document.getElementById('goalTime').value),
        current: 0
    };
    state.tasks.unshift(newTask);
    save();
    goalForm.reset();
};

window.manualUpdate = (id, val) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.current = Math.min(Math.max(0, parseInt(val) || 0), task.target);
        save();
    }
};

window.toggleQuickFinish = (id) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.current = (task.current >= task.target) ? 0 : task.target;
        save();
    }
};

window.deleteTask = (id) => {
    state.tasks = state.tasks.filter(t => t.id !== id);
    save();
};

init();
