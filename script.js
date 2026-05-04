const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const goalsContainer = document.getElementById('goalsContainer');
const goalForm = document.getElementById('goalForm');
const modal = document.getElementById('modal');
let goals = [];

async function init() {
    await loadGoals();
    lucide.createIcons();
}

async function loadGoals() {
    const { data, error } = await _supabase.from('goals').select('*').order('created_at', { ascending: false });
    if (!error) {
        goals = data;
        render();
    }
}

function render() {
    goalsContainer.innerHTML = '';
    goals.forEach(goal => {
        const isComplete = goal.current_progress >= goal.target_time;
        const div = document.createElement('div');
        div.className = `goal-card p-6 rounded-3xl ${isComplete ? 'completed-style' : ''}`;
        div.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-white font-bold text-lg">${goal.name}</h3>
                    <p class="text-slate-500 text-xs mt-1 font-medium tracking-wide">${goal.current_progress} / ${goal.target_time} MINUTES</p>
                </div>
                <div class="flex gap-1">
                    <button onclick="editGoal('${goal.id}')" class="p-2 text-slate-500 hover:text-white transition-colors"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                    <button onclick="deleteGoal('${goal.id}')" class="p-2 text-slate-500 hover:text-red-400 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
            <progress class="w-full mb-6" value="${goal.current_progress}" max="${goal.target_time}"></progress>
            <div class="flex items-center gap-4">
                <input type="range" min="0" max="${goal.target_time}" value="${goal.current_progress}" 
                    class="flex-1" onchange="updateProgress('${goal.id}', this.value)">
                ${isComplete ? '<span class="text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded">Finished</span>' : ''}
            </div>
        `;
        goalsContainer.appendChild(div);
    });
    lucide.createIcons();
}

async function updateProgress(id, val) {
    await _supabase.from('goals').update({ current_progress: parseInt(val) }).eq('id', id);
    loadGoals();
}

async function deleteGoal(id) {
    if (confirm('Remove this goal?')) {
        await _supabase.from('goals').delete().eq('id', id);
        loadGoals();
    }
}

goalForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('goalId').value;
    const name = document.getElementById('goalName').value;
    const time = document.getElementById('goalTime').value;

    if (id) {
        await _supabase.from('goals').update({ name, target_time: time }).eq('id', id);
    } else {
        await _supabase.from('goals').insert([{ name, target_time: time, current_progress: 0 }]);
    }
    
    modal.classList.add('hidden');
    loadGoals();
};

// UI Toggles
document.getElementById('addGoalBtn').onclick = () => {
    goalForm.reset();
    document.getElementById('goalId').value = '';
    document.getElementById('modalTitle').innerText = 'New Goal';
    modal.classList.remove('hidden');
};
document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

function editGoal(id) {
    const g = goals.find(x => x.id === id);
    document.getElementById('goalId').value = g.id;
    document.getElementById('goalName').value = g.name;
    document.getElementById('goalTime').value = g.target_time;
    document.getElementById('modalTitle').innerText = 'Edit Goal';
    modal.classList.remove('hidden');
}

init();
