const goalsContainer = document.getElementById('goalsContainer');
const goalForm = document.getElementById('goalForm');
const progressRing = document.getElementById('globalProgressRing');
const globalPercentText = document.getElementById('globalPercent');
const currentDayText = document.getElementById('currentDay');
const motivationDisplay = document.getElementById('motivationText');

const motivations = [
    "Execution is everything.", "Make it happen, no excuses.", "Stay hungry. Stay focused.",
    "Be obsessed or be average.", "Consistency is the only bridge.", "One task at a time.",
    "Results don't lie.", "Win the morning, win the day.", "Eyes on the prize.",
    "Progress over perfection.", "Act as if failure is impossible.", "Focus is a superpower.",
    "Don't wish for it, work for it.", "Outwork your potential.", "Burn the ships."
];

let state = JSON.parse(localStorage.getItem('goals_tracker_v6')) || {
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

// Logic to show 1.5h instead of 90m
function formatTime(mins) {
    if (mins < 60) return `${mins}m`;
    const hours = (mins / 60).toFixed(1);
    return `${hours}h`;
}

function save() {
    localStorage.setItem('goals_tracker_v6', JSON.stringify(state));
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
        div.className = `task-row flex items-center justify-between p-5 rounded-2xl ${isDone ? 'task-done' : ''}`;
        
        div.innerHTML = `
            <div class="flex items-center gap-4 z-10">
                <button onclick="toggleQuickFinish('${task.id}')" class="w-6 h-6 rounded-lg border-2 border-zinc-800 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500' : 'hover:border-blue-500'}">
                    ${isDone ? '<i data-lucide="check" class="w-4 h-4 text-black stroke-[4]"></i>' : ''}
                </button>
                <div>
                    <h3 class="text-sm font-bold text-white tracking-tight">${task.name}</h3>
                    <p class="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                        ${formatTime(task.current)} / ${formatTime(task.target)}
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-4 z-10">
                <input type="number" value="${task.current}" 
                    onchange="manualUpdate('${task.id}', this.value)"
                    class="w-14 bg-white/5 border border-white/10 rounded-lg py-1.5 text-center text-xs font-bold text-white outline-none focus:border-blue-500/50">
                <button onclick="deleteTask('${task.id}')" class="text-zinc-800 hover:text-red-500 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="progress-track">
                <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
        `;
        goalsContainer.appendChild(div);
    });

    const avgProgress = state.tasks.length ? Math.round(totalProgress / state.tasks.length) : 0;
    const offset = 263.9 - (263.9 * avgProgress) / 100;
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
