let fullness = 20;
let isSleeping = false;
let eatingTimeout = null;

const CHARACTER_STATES = {
    hungry: 'assets/character_hungry.png',
    eating: 'assets/character_eating.png',
    sleeping: 'assets/character_sleeping.png'
};

const phrases = {
    hungry: ["«Жду пельмени...»", "«Живот урчит... Где еда?»", "«Срочно подкрепимся!»"],
    eating: ["«О да! Очень вкусно!»", "«Ммм, пальчики оближешь!»", "«Еще порцию!»"],
    full: ["«Я полностью сыт! Пора отдохнуть...»", "«Отличный обед. Время спать.»"],
    sleeping: ["«Хррр... Zzz...»", "«Спит и видит во сне пельмени...»"]
};

function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        if (type === 'eat') {
            oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
            oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'sleep') {
            oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(60, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
            oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
            oscillator.start(); oscillator.stop(audioCtx.currentTime + 1.5);
        }
    } catch(e) {}
}

function updateUI() {
    const fill = document.getElementById('fullness-fill');
    const percent = document.getElementById('fullness-percent');
    const badge = document.getElementById('status-badge');
    const speech = document.getElementById('speech-bubble');
    const sleepBtn = document.getElementById('sleep-btn');
    const img = document.getElementById('character-img');
    const sleepOverlay = document.getElementById('sleep-overlay');

    fill.style.width = fullness + '%';
    percent.innerText = fullness + '%';

    if (fullness < 30) { fill.style.background = '#e74c3c'; } 
    else if (fullness < 70) { fill.style.background = '#f1c40f'; } 
    else { fill.style.background = '#2ecc71'; }

    if (fullness >= 80) { sleepBtn.disabled = false; } 
    else if (!isSleeping) { sleepBtn.disabled = true; }

    if (isSleeping) {
        badge.className = "badge sleeping"; badge.innerText = "Спит 😴";
        img.src = CHARACTER_STATES.sleeping;
        sleepOverlay.classList.remove('hidden');
        return;
    }

    sleepOverlay.classList.add('hidden');

    if (fullness < 50) {
        badge.className = "badge hungry"; badge.innerText = "Голодный 🤤";
        if (!eatingTimeout) img.src = CHARACTER_STATES.hungry;
        if (!eatingTimeout && speech.innerText === phrases.full[0]) speech.innerText = phrases.hungry[0];
    } else {
        badge.className = "badge eating"; badge.innerText = "Сытый 😎";
        if (!eatingTimeout) img.src = CHARACTER_STATES.eating;
    }
}

function getRandomPhrase(type) {
    const list = phrases[type];
    return list[Math.floor(Math.random() * list.length)];
}

function feed(amount, foodName) {
    if (isSleeping) {
        document.getElementById('speech-bubble').innerText = "«Тссс! Я сплю!»";
        return;
    }

    fullness = Math.min(100, fullness + amount);
    playSound('eat');
    
    const img = document.getElementById('character-img');
    const speech = document.getElementById('speech-bubble');
    const glow = document.getElementById('eating-glow');

    img.src = CHARACTER_STATES.eating;
    img.classList.add('chew');
    glow.classList.remove('hidden');
    speech.innerText = `Съел ${foodName}! ${getRandomPhrase('eating')}`;

    if (eatingTimeout) clearTimeout(eatingTimeout);
    
    eatingTimeout = setTimeout(() => {
        img.classList.remove('chew');
        glow.classList.add('hidden');
        eatingTimeout = null;
        if (fullness >= 100) { speech.innerText = phrases.full[0]; }
        updateUI();
    }, 1200);

    updateUI();
}

function toggleSleep() {
    const speech = document.getElementById('speech-bubble');
    const sleepBtn = document.getElementById('sleep-btn');

    if (!isSleeping) {
        if (fullness < 80) return;
        isSleeping = true;
        sleepBtn.innerText = "⏰ Разбудить";
        speech.innerText = getRandomPhrase('sleeping');
        playSound('sleep');
    } else {
        isSleeping = false;
        sleepBtn.innerText = "😴 Поспать";
        speech.innerText = "«Ох, отлично поспал!»";
    }
    updateUI();
}

setInterval(() => {
    if (isSleeping) {
        fullness = Math.max(0, fullness - 2);
        if (fullness === 0) {
            toggleSleep();
            document.getElementById('speech-bubble').innerText = "«Проснулся от голода!»";
        } else { playSound('sleep'); }
    } else {
        fullness = Math.max(0, fullness - 3);
    }
    updateUI();
}, 4000);

updateUI();
