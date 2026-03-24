const positions = [
    'Americana', 'Estrangulamento Costas', 'Katagatame', 'Kimura', 
    'Passagem do Baldinho', 'Armlock', 'Puxada para Guarda', 'Raspagem Tesourinha'
];

let cardsArray = [...positions, ...positions];
let flippedCards = [];
let matchedCount = 0;
let stamina = 100;

function startGame() {
    document.getElementById('instructions-modal').style.display = 'none';
    resetGame();
}

function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => console.log("Áudio aguardando clique."));
    }
}

function createBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    cardsArray.sort(() => 0.5 - Math.random());
    cardsArray.forEach(pos => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.name = pos;
        card.innerHTML = `
            <div class="back">?</div>
            <div class="front"><img src="assets/${pos}.jpg" class="card-img" onerror="this.src='https://via.placeholder.com/150?text=OSS'"></div>
        `;
        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flip') && stamina > 0) {
        this.classList.add('flip');
        flippedCards.push(this);
        if (flippedCards.length === 2) setTimeout(checkMatch, 600);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.name === card2.dataset.name) {
        showQuiz(card1.dataset.name);
    } else {
        stamina -= 15;
        playSound('snd-error');
        setTimeout(() => {
            card1.classList.remove('flip');
            card2.classList.remove('flip');
            flippedCards = [];
        }, 700);
    }
    updateUI();
}

function showQuiz(correctName) {
    const overlay = document.getElementById('quiz-overlay');
    const container = document.getElementById('quiz-options');
    overlay.style.display = 'flex';
    container.innerHTML = '';

    // Lógica de Distratores (Opções erradas)
    let options = [correctName];
    let others = positions.filter(p => p !== correctName).sort(() => 0.5 - Math.random());
    options.push(others[0], others[1]);
    options.sort(() => 0.5 - Math.random());

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.classList.add('quiz-btn');
        btn.innerText = opt.toUpperCase();
        btn.onclick = () => validateQuiz(opt, correctName);
        container.appendChild(btn);
    });
}

function validateQuiz(selected, correct) {
    const overlay = document.getElementById('quiz-overlay');
    const [card1, card2] = flippedCards;

    if (selected === correct) {
        matchedCount++;
        stamina = Math.min(stamina + 8, 100);
        playSound('snd-match');
        overlay.style.display = 'none';
        flippedCards = [];
        updateRank();
        if (matchedCount === positions.length) alert("VITÓRIA POR FINALIZAÇÃO! OSS!");
    } else {
        stamina -= 15;
        playSound('snd-error');
        overlay.style.display = 'none';
        setTimeout(() => {
            card1.classList.remove('flip');
            card2.classList.remove('flip');
            flippedCards = [];
        }, 500);
    }
    updateUI();
}

function updateUI() {
    const inner = document.getElementById('stamina-inner');
    inner.style.width = stamina + "%";
    document.getElementById('damage-overlay').className = stamina < 30 ? 'critical-stamina' : '';
    if (stamina <= 0) {
        playSound('snd-gameover');
        alert("BATEU! O gás acabou e você foi finalizado.");
        resetGame();
    }
}

function updateRank() {
    const ranks = ["FAIXA BRANCA", "FAIXA AZUL", "FAIXA ROXA", "FAIXA MARROM", "FAIXA PRETA"];
    const colors = ["#ffffff", "#3498db", "#9b59b6", "#8b4513", "#e74c3c"];
    const index = Math.min(Math.floor(matchedCount / 1.7), 4);
    const el = document.getElementById('rank');
    el.innerText = ranks[index];
    el.style.color = colors[index];
}

function resetGame() {
    stamina = 100; matchedCount = 0; flippedCards = [];
    document.getElementById('quiz-overlay').style.display = 'none';
    updateUI(); updateRank(); createBoard();
}