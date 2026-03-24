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
    const s = document.getElementById(id);
    if (s) { s.currentTime = 0; s.play().catch(() => {}); }
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
            <div class="front">
                <img src="assets/${pos}.jpg" class="card-img" onerror="this.src='https://via.placeholder.com/150?text=BJJ'">
            </div>`;
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
    const [c1, c2] = flippedCards;
    if (c1.dataset.name === c2.dataset.name) {
        showQuiz(c1.dataset.name);
    } else {
        stamina -= 15;
        playSound('snd-error');
        setTimeout(() => { 
            c1.classList.remove('flip'); 
            c2.classList.remove('flip'); 
            flippedCards = []; 
        }, 700);
    }
    updateUI();
}

function showQuiz(correct) {
    const overlay = document.getElementById('quiz-overlay');
    const container = document.getElementById('quiz-options');
    overlay.style.display = 'flex';
    container.innerHTML = '';

    let opts = [correct, ...positions.filter(p => p !== correct)
        .sort(() => 0.5 - Math.random()).slice(0, 2)]
        .sort(() => 0.5 - Math.random());

    opts.forEach(opt => {
        const b = document.createElement('button');
        b.classList.add('quiz-btn');
        b.innerText = opt.toUpperCase();
        b.onclick = () => {
            overlay.style.display = 'none';
            if (opt === correct) {
                matchedCount++; 
                stamina = Math.min(stamina + 8, 100);
                playSound('snd-match'); 
                flippedCards = []; 
                updateRank();
                if (matchedCount === positions.length) alert("VITÓRIA POR FINALIZAÇÃO! OSS!");
            } else {
                stamina -= 15; 
                playSound('snd-error');
                setTimeout(() => { 
                    flippedCards.forEach(c => c.classList.remove('flip')); 
                    flippedCards = []; 
                }, 500);
            }
            updateUI();
        };
        container.appendChild(b);
    });
}

function updateUI() {
    document.getElementById('stamina-inner').style.width = stamina + "%";
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
    const idx = Math.min(Math.floor(matchedCount / 1.7), 4);
    const el = document.getElementById('rank');
    el.innerText = ranks[idx];
    el.style.color = colors[idx];
}

function resetGame() {
    stamina = 100; matchedCount = 0; flippedCards = [];
    document.getElementById('quiz-overlay').style.display = 'none';
    updateUI(); updateRank(); createBoard();
}