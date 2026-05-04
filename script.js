const goalsContainer = document.getElementById('goalsContainer');
const goalForm = document.getElementById('goalForm');
const modal = document.getElementById('modal');
const addGoalBtn = document.getElementById('addGoalBtn');
const closeModal = document.getElementById('closeModal');

let goals = JSON.parse(localStorage.getItem('lumo_goals')) || [];

function save() {
    localStorage.setItem('lumo_goals', JSON.stringify(goals));
    render();
}

function render() {
    goalsContainer.innerHTML = '';
    goals.forEach((goal) => {
        const isComplete = goal.current >= goal.target;
        const div = document.createElement('div');
        div.className = `goal-card p-6 rounded-3xl ${isComplete ? 'completed-style' : ''}`;
        div.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-white font-bold text-lg">${goal.name}</h3>
                    <p class="text-slate-500 text-xs mt-1 uppercase tracking-widest">${goal.current} / ${goal.target} MINS</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="deleteGoal('${goal.id}')" class="text-slate-500 hover:text-red-400 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
            <progress class="mb-6" value="${goal.current}" max="${goal.target}"></progress>
            <div class="flex items-center gap-4">
                <input type="range" min="0" max="${goal.target}" value="${goal.current}" 
                    class="flex-1" oninput="updateProgress('${goal.id}', this.value)">
                ${isComplete ? '<span class="text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-400/30 px-2 py-1 rounded">Done</span>' : ''}
            </div>
        `;
        goalsContainer.appendChild(div);
    });
    lucide.createIcons();
}

goalForm.onsubmit = (e) => {
    e.preventDefault();
    const newGoal = {
        id: Date.now().toString(),
        name: document.getElementById('goalName').value,
        target: parseInt(document.getElementById('goalTime').value),
        current: 0
    };
    goals.push(newGoal);
    save();
    modal.classList.add('hidden');
    goalForm.reset();
};

window.updateProgress = (id, val) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.current = parseInt(val);
        save();
    }
};

window.deleteGoal = (id) => {
    goals = goals.filter(g => g.id !== id);
    save();
};

addGoalBtn.onclick = () => modal.classList.remove('hidden');
closeModal.onclick = () => modal.classList.add('hidden');

// Initial Render
render();
