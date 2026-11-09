let fullness = 20;
let isSleeping = false;
let eatingTimeout = null;

const CHARACTER_STATES = {
    hungry: 'character_hungry.png',
    eating: 'character_eating.png',
    sleeping: 'character_sleeping.png'
};

const phrases = {
    hungry: ["«Жду пельмени...»", "«Живот урчит... Где еда?»", "«Срочно подкрепимся!»"],
    eating: ["«О да! Очень вкусно!»", "«Ммм, пальчики оближешь!»", "«Еще порцию!»"],
    full: ["«Я полностью сыт! Пора отдохнуть...»", "«Отличный обед. Время спать.»"],
    sleeping: ["«Хррр... Zzz...»", "«Спит и видит во сне пельмени...»"]
};

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

    if (fullness >= 80) { 
        sleepBtn.disabled = false; 
    } else if (!isSleeping) { 
        sleepBtn.disabled = true; 
    }

    if (isSleeping) {
        badge.className = "badge sleeping"; 
        badge.innerText = "Спит 😴";
        img.src = CHARACTER_STATES.sleeping;
        sleepOverlay.classList.remove('hidden');
        return;
    }

    sleepOverlay.classList.add('hidden');

    if (fullness < 50) {
        badge.className = "badge hungry"; 
        badge.innerText = "Голодный 🤤";
        if (!eatingTimeout) img.src = CHARACTER_STATES.hungry;
        if (!eatingTimeout && speech.innerText === phrases.full[0]) speech.innerText = phrases.hungry[0];
    } else {
        badge.className = "badge eating"; 
        badge.innerText = "Сытый 😎";
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
    }, 1000);

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
    } else {
        isSleeping = false;
        sleepBtn.innerText = "😴 Поспать";
        speech.innerText = "«Ох, отлично поспал!»";
    }
    updateUI();
}

// Авто-убывание сытости
setInterval(() => {
    if (isSleeping) {
        fullness = Math.max(0, fullness - 2);
        if (fullness === 0) {
            toggleSleep();
            document.getElementById('speech-bubble').innerText = "«Проснулся от голода!»";
        }
    } else {
        fullness = Math.max(0, fullness - 3);
    }
    updateUI();
}, 4000);

updateUI();
