// --- CONFIGURATION ---
const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- STATE & DOM ---
let currentUser = null;
let state = { tasks: [], date: new Date().toLocaleDateString() };

const goalsContainer = document.getElementById('goalsContainer');
const goalForm = document.getElementById('goalForm');
const progressRing = document.getElementById('globalProgressRing');
const globalPercentText = document.getElementById('globalPercent');
const motivationDisplay = document.getElementById('motivationText');
const authOverlay = document.getElementById('authOverlay');
const mainApp = document.getElementById('mainApp');

const motivations = [
    "Execution is everything.", "Make it happen, no excuses.", "Stay hungry. Stay focused.",
    "Be obsessed or be average.", "Consistency is the only bridge.", "One task at a time.",
    "Results don't lie.", "Win the morning, win the day.", "Focus is a superpower."
];

// --- AUTH HANDLERS ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        authOverlay.classList.add('hidden');
        mainApp.classList.remove('hidden');
        loadData();
    } else {
        currentUser = null;
        authOverlay.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
});

document.getElementById('signupBtn').onclick = () => {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPassword').value;
    auth.createUserWithEmailAndPassword(email, pass).catch(err => alert(err.message));
};

document.getElementById('loginBtn').onclick = () => {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPassword').value;
    auth.signInWithEmailAndPassword(email, pass).catch(err => alert(err.message));
};

document.getElementById('logoutBtn').onclick = () => auth.signOut();

// --- DATA HANDLERS ---
async function loadData() {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists) {
        state = doc.data();
        checkDailyReset();
    }
    render();
}

async function save(shouldRender = true) {
    if (currentUser) {
        await db.collection('users').doc(currentUser.uid).set(state);
    }
    if (shouldRender) render();
}

function checkDailyReset() {
    const today = new Date().toLocaleDateString();
    if (state.date !== today) {
        state.tasks.forEach(t => t.current = 0);
        state.date = today;
        save();
    }
}

// --- DRAG & DROP ---
new Sortable(goalsContainer, {
    animation: 200,
    ghostClass: 'sortable-ghost',
    onEnd: function() {
        const newOrderIds = Array.from(goalsContainer.querySelectorAll('.task-block')).map(el => el.dataset.id);
        state.tasks.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
        save(false);
    }
});

// --- RENDER & ACTIONS ---
function formatTime(mins) {
    if (mins < 60) return `${mins}M`;
    return `${(mins / 60).toFixed(1)}H`;
}

function render() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('currentDay').innerText = new Date().toLocaleDateString('en-US', options);
    
    motivationDisplay.innerText = `"${motivations[Math.floor(Math.random() * motivations.length)]}"`;
    goalsContainer.innerHTML = '';
    let totalProgress = 0;

    state.tasks.forEach((task) => {
        const isDone = task.current >= task.target;
        const percent = Math.min((task.current / task.target) * 100, 100);
        totalProgress += percent;

        const div = document.createElement('div');
        div.className = `task-block flex flex-col justify-between ${isDone ? 'task-done' : ''}`;
        div.setAttribute('data-id', task.id);
        
        div.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <button onclick="toggleQuickFinish('${task.id}')" class="w-6 h-6 rounded border-2 border-zinc-800 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500' : 'hover:border-blue-500'}">
                    ${isDone ? '<i data-lucide="check" class="w-3 h-3 text-black stroke-[4]"></i>' : ''}
                </button>
                <button onclick="deleteTask('${task.id}')" class="text-zinc-800 hover:text-red-500 transition-colors">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
            <div class="mb-4">
                <h3 class="text-sm font-bold text-white tracking-tight mb-1 truncate">${task.name}</h3>
                <p class="text-[9px] text-zinc-500 font-black uppercase tracking-widest">${formatTime(task.current)} / ${formatTime(task.target)}</p>
            </div>
            <input type="number" value="${task.current}" onchange="manualUpdate('${task.id}', this.value)" class="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-[10px] font-bold text-white outline-none">
            <div class="progress-track"><div class="progress-bar" style="width: ${percent}%"></div></div>
        `;
        goalsContainer.appendChild(div);
    });

    const avgProgress = state.tasks.length ? Math.round(totalProgress / state.tasks.length) : 0;
    progressRing.style.strokeDashoffset = 364.4 - (364.4 * avgProgress) / 100;
    globalPercentText.innerText = `${avgProgress}%`;
    lucide.createIcons();
}

goalForm.onsubmit = (e) => {
    e.preventDefault();
    const newTask = { id: crypto.randomUUID(), name: document.getElementById('goalName').value, target: parseInt(document.getElementById('goalTime').value), current: 0 };
    state.tasks.unshift(newTask);
    save();
    goalForm.reset();
};

window.manualUpdate = (id, val) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) { task.current = Math.min(Math.max(0, parseInt(val) || 0), task.target); save(); }
};

window.toggleQuickFinish = (id) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) { task.current = (task.current >= task.target) ? 0 : task.target; save(); }
};

window.deleteTask = (id) => {
    state.tasks = state.tasks.filter(t => t.id !== id);
    save();
};
