const goalsContainer = document.getElementById('goalsContainer');
const goalForm = document.getElementById('goalForm');
const progressRing = document.getElementById('globalProgressRing');
const globalPercentText = document.getElementById('globalPercent');
const currentDayText = document.getElementById('currentDay');

let state = JSON.parse(localStorage.getItem('daily_pulse_v3')) || {
    date: new Date().toLocaleDateString(),
    tasks: []
};

// Check for Daily Reset
function checkDailyReset() {
    const today = new Date().toLocaleDateString();
    if (state.date !== today) {
        // Reset progress but keep task names/targets
        state.tasks.forEach(t => t.current = 0);
        state.date = today;
        save();
    }
}

function save() {
    localStorage.setItem('daily_pulse_v3', JSON.stringify(state));
    render();
}

function render() {
    checkDailyReset();
    
    // Set Header Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    currentDayText.innerText = new Date().toLocaleDateString('en-US', options);

    goalsContainer.innerHTML = '';
    let totalProgress = 0;

    state.tasks.forEach((task) => {
        const isDone = task.current >= task.target;
        const percent = Math.min((task.current / task.target) * 100, 100);
        totalProgress += percent;

        const div = document.createElement('div');
        div.className = `task-row relative group flex items-center justify-between p-4 rounded-2xl overflow-hidden ${isDone ? 'task-done' : ''}`;
        
        div.innerHTML = `
            <div class="flex items-center gap-4 z-10">
                <button onclick="toggleQuickFinish('${task.id}')" class="w-5 h-5 rounded-md border-2 border-zinc-700 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500' : 'hover:border-zinc-500'}">
                    ${isDone ? '<i data-lucide="check" class="w-3 h-3 text-black stroke-[4]"></i>' : ''}
                </button>
                <div>
                    <h3 class="text-sm font-semibold transition-all">${task.name}</h3>
                    <p class="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">${task.current} / ${task.target}m</p>
                </div>
            </div>

            <div class="flex items-center gap-3 z-10">
                <div class="relative group/input">
                    <input type="number" value="${task.current}" 
                        onchange="manualUpdate('${task.id}', this.value)"
                        class="w-12 bg-zinc-900 border border-zinc-800 rounded-lg py-1 text-center text-[10px] font-bold outline-none focus:border-blue-500/50">
                    <span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] px-2 py-0.5 rounded opacity-0 group-hover/input:opacity-100 transition-all pointer-events-none">Update Mins</span>
                </div>
                <button onclick="deleteTask('${task.id}')" class="text-zinc-700 hover:text-red-500 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="mini-progress">
                <div class="mini-progress-fill" style="width: ${percent}%"></div>
            </div>
        `;
        goalsContainer.appendChild(div);
    });

    // Update Global Progress
    const avgProgress = state.tasks.length ? Math.round(totalProgress / state.tasks.length) : 0;
    const offset = 150.8 - (150.8 * avgProgress) / 100;
    progressRing.style.strokeDashoffset = offset;
    globalPercentText.innerText = `${avgProgress}%`;

    lucide.createIcons();
}

// Actions
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

// Start
render();
