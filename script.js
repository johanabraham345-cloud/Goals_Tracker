const goalsContainer = document.getElementById('goalsContainer');
const goalForm = document.getElementById('goalForm');
const progressRing = document.getElementById('globalProgressRing');
const globalPercentText = document.getElementById('globalPercent');
const currentDayText = document.getElementById('currentDay');
const motivationDisplay = document.getElementById('motivationText');

const motivations = [
    "Precision beats speed. Focus.", "Execution is everything.", "Make it happen, no excuses.",
    "Don't stop when you're tired, stop when you're done.", "Stay hungry. Stay focused.",
    "Small wins lead to massive results.", "Your future is created by what you do today.",
    "Discipline is choosing between what you want now and what you want most.",
    "Be obsessed or be average.", "Consistency is the only bridge to success.",
    "Success is a series of small tasks completed daily.", "Silence the noise. Get to work.",
    "One task at a time. Total focus.", "Average is the enemy.", "Outwork your potential.",
    "Progress over perfection.", "Win the morning, win the day.", "Do it with intensity.",
    "The secret of your future is hidden in your daily routine.", "Eyes on the prize.",
    "Burn the ships. No turning back.", "Greatness is a habit, not an act.",
    "Act as if failure is impossible.", "Results don't lie.", "Work hard in silence, let success be your noise.",
    "Every minute counts. Use them.", "Upgrade your habits, upgrade your life.",
    "Turn intent into action.", "Focus is a superpower.", "Don't wish for it, work for it.",
    // ... Imagine 70 more high-intensity quotes here
];

let state = JSON.parse(localStorage.getItem('goals_tracker_v4')) || {
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

function save() {
    localStorage.setItem('goals_tracker_v4', JSON.stringify(state));
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
        div.className = `task-row relative group flex items-center justify-between p-5 rounded-2xl overflow-hidden ${isDone ? 'task-done' : ''}`;
        
        div.innerHTML = `
            <div class="flex items-center gap-4 z-10">
                <button onclick="toggleQuickFinish('${task.id}')" class="w-6 h-6 rounded-lg border-2 border-zinc-800 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'hover:border-blue-500'}">
                    ${isDone ? '<i data-lucide="check" class="w-4 h-4 text-black stroke-[4]"></i>' : ''}
                </button>
                <div>
                    <h3 class="text-sm font-bold text-white tracking-tight">${task.name}</h3>
                    <p class="text-[10px] text-zinc-500 font-black uppercase tracking-widest">${task.current} / ${task.target} MINS</p>
                </div>
            </div>

            <div class="flex items-center gap-4 z-10">
                <input type="number" value="${task.current}" 
                    onchange="manualUpdate('${task.id}', this.value)"
                    class="w-14 bg-white/5 border border-white/10 rounded-lg py-1.5 text-center text-xs font-bold text-white outline-none focus:border-blue-500/50">
                <button onclick="deleteTask('${task.id}')" class="text-zinc-700 hover:text-red-500 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="progress-track">
                <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
        `;
        goalsContainer.appendChild(div);
    });

    // Update Global Ring (175.9 is the circumference for r=28)
    const avgProgress = state.tasks.length ? Math.round(totalProgress / state.tasks.length) : 0;
    const offset = 175.9 - (175.9 * avgProgress) / 100;
    progressRing.style.strokeDashoffset = offset;
    globalPercentText.innerText = `${avgProgress}%`;

    lucide.createIcons();
}

// Logic Actions
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
