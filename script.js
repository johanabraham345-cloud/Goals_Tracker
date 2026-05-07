// --- PASTE YOUR FIREBASE DATA BELOW ---
const firebaseConfig = {
    apiKey: "AIzaSyCnSgN3iULYu1MY8DfRhjBdDKrffMNV3_M",
    authDomain: "goals-tracker-7906d.firebaseapp.com",
    projectId: "goals-tracker-7906d",
    storageBucket: "goals-tracker-7906d.firebasestorage.app",
    messagingSenderId: "91273394036",
    appId: "1:91273394036:web:2d88ab9213b7fe45d79e21"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

let currentUser = null;
let state = { tasks: [], date: new Date().toLocaleDateString() };

const motivations = ["Execution is everything.", "Make it happen.", "Stay focused.", "Results don't lie."];

// --- AUTH HANDLERS ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        loadData();
    } else {
        currentUser = null;
        document.getElementById('authOverlay').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }
});

document.getElementById('googleLoginBtn').onclick = () => auth.signInWithPopup(googleProvider).catch(err => alert(err.message));
document.getElementById('loginBtn').onclick = () => auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPassword').value).catch(err => alert(err.message));
document.getElementById('signupBtn').onclick = () => auth.createUserWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPassword').value).catch(err => alert(err.message));
document.getElementById('logoutBtn').onclick = () => auth.signOut();

// --- DATA HANDLERS ---
async function loadData() {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists) {
        state = doc.data();
        if (state.date !== new Date().toLocaleDateString()) {
            state.tasks.forEach(t => t.current = 0);
            state.date = new Date().toLocaleDateString();
            save();
        }
    }
    render();
}

async function save(renderApp = true) {
    if (currentUser) await db.collection('users').doc(currentUser.uid).set(state);
    if (renderApp) render();
}

new Sortable(document.getElementById('goalsContainer'), {
    animation: 200, ghostClass: 'sortable-ghost',
    onEnd: () => {
        const ids = Array.from(document.querySelectorAll('.task-block')).map(el => el.dataset.id);
        state.tasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
        save(false);
    }
});

function render() {
    document.getElementById('currentDay').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('motivationText').innerText = `"${motivations[Math.floor(Math.random() * motivations.length)]}"`;
    const container = document.getElementById('goalsContainer');
    container.innerHTML = '';
    let total = 0;

    state.tasks.forEach(task => {
        const isDone = task.current >= task.target;
        const pct = Math.min((task.current / task.target) * 100, 100);
        total += pct;
        const div = document.createElement('div');
        div.className = `task-block flex flex-col justify-between ${isDone ? 'task-done' : ''}`;
        div.setAttribute('data-id', task.id);
        div.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <button onclick="toggleQuickFinish('${task.id}')" class="w-6 h-6 rounded border-2 border-zinc-800 flex items-center justify-center ${isDone ? 'bg-emerald-500 border-emerald-500' : ''}">
                    ${isDone ? '<i data-lucide="check" class="w-3 h-3 text-black"></i>' : ''}
                </button>
                <button onclick="deleteTask('${task.id}')" class="text-zinc-800 hover:text-red-500"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            <div class="mb-4"><h3 class="text-sm font-bold text-white">${task.name}</h3><p class="text-[9px] text-zinc-500 uppercase font-black">${task.current}/${task.target}M</p></div>
            <input type="number" value="${task.current}" onchange="manualUpdate('${task.id}', this.value)" class="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-[10px] font-bold text-white outline-none">
            <div class="progress-track"><div class="progress-bar" style="width: ${pct}%"></div></div>`;
        container.appendChild(div);
    });

    const avg = state.tasks.length ? Math.round(total / state.tasks.length) : 0;
    document.getElementById('globalProgressRing').style.strokeDashoffset = 364.4 - (364.4 * avg / 100);
    document.getElementById('globalPercent').innerText = avg + '%';
    lucide.createIcons();
}

document.getElementById('goalForm').onsubmit = (e) => {
    e.preventDefault();
    state.tasks.unshift({ id: crypto.randomUUID(), name: document.getElementById('goalName').value, target: parseInt(document.getElementById('goalTime').value), current: 0 });
    save(); document.getElementById('goalForm').reset();
};

window.manualUpdate = (id, v) => { const t = state.tasks.find(x => x.id === id); t.current = Math.min(Math.max(0, parseInt(v)||0), t.target); save(); };
window.toggleQuickFinish = (id) => { const t = state.tasks.find(x => x.id === id); t.current = t.current >= t.target ? 0 : t.target; save(); };
window.deleteTask = (id) => { state.tasks = state.tasks.filter(x => x.id !== id); save(); };
