const goalsContainer = document.getElementById('goalsContainer');
const goalForm = document.getElementById('goalForm');
const modal = document.getElementById('modal');
const addGoalBtn = document.getElementById('addGoalBtn');
const closeModal = document.getElementById('closeModal');

let goals = JSON.parse(localStorage.getItem('lumo_v2')) || [];

function save() {
    localStorage.setItem('lumo_v2', JSON.stringify(goals));
    render();
}

function render() {
    goalsContainer.innerHTML = '';
    
    if (goals.length === 0) {
        goalsContainer.innerHTML = `
            <div class="py-20 text-center text-slate-600 font-medium italic animate-pulse">
                No active missions.
            </div>
        `;
    }

    goals.forEach((goal) => {
        const isComplete = goal.current >= goal.target;
        const percentage = Math.min((goal.current / goal.target) * 100, 100);
        
        const div = document.createElement('div');
        div.className = `goal-card p-8 group ${isComplete ? 'completed-card' : ''}`;
        
        div.innerHTML = `
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h3 class="text-xl font-bold text-white tracking-tight">${goal.name}</h3>
                    <div class="flex items-center gap-3 mt-1">
                        <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                            ${goal.current} / ${goal.target} MINS
                        </span>
                        ${isComplete ? '<span class="w-1 h-1 rounded-full bg-emerald-500"></span><span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>' : ''}
                    </div>
                </div>
                <button onclick="deleteGoal('${goal.id}')" class="p-2 opacity-0 group-hover:opacity-100 transition-all text-slate-500 hover:text-red-500">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="progress-bg mb-8">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>

            <div class="flex items-center justify-between gap-4">
                <div class="flex gap-2">
                    <button onclick="addTime('${goal.id}', 5)" class="step-btn px-4 py-2 rounded-xl text-[10px] font-bold text-slate-300">
                        +5 MIN
                    </button>
                    <button onclick="addTime('${goal.id}', 15)" class="step-btn px-4 py-2 rounded-xl text-[10px] font-bold text-slate-300">
                        +15 MIN
                    </button>
                </div>
                <button onclick="toggleComplete('${goal.id}')" 
                    class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${isComplete ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}">
                    ${isComplete ? 'Completed' : 'Finish Now'}
                </button>
            </div>
        `;
        goalsContainer.appendChild(div);
    });
    lucide.createIcons();
}

// Logic
window.addTime = (id, mins) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.current = Math.min(goal.current + mins, goal.target);
        save();
    }
};

window.toggleComplete = (id) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.current = (goal.current >= goal.target) ? 0 : goal.target;
        save();
    }
};

window.deleteGoal = (id) => {
    goals = goals.filter(g => g.id !== id);
    save();
};

goalForm.onsubmit = (e) => {
    e.preventDefault();
    const newGoal = {
        id: Date.now().toString(),
        name: document.getElementById('goalName').value,
        target: parseInt(document.getElementById('goalTime').value),
        current: 0
    };
    goals.unshift(newGoal);
    save();
    modal.classList.add('hidden');
    goalForm.reset();
};

addGoalBtn.onclick = () => modal.classList.remove('hidden');
closeModal.onclick = () => modal.classList.add('hidden');

// Start
render();
