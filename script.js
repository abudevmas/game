const gridRows = 4, gridCols = 8, maxNum = 63;
const numberGrid = document.getElementById('numberGrid');
const instructions = document.getElementById('instructions');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');
const resultDiv = document.getElementById('result');
const userInput = document.getElementById('userInput');

let phase = 'start'; // start, card, done
let currentCardIdx = 0;
let cardAnswers = [];
let cards = [];

// Generate the 6 cards as per the photo (each card: numbers where the bit is set)
function generateCards() {
    cards = [];
    for (let bit = 0; bit < 6; bit++) {
        let card = [];
        for (let n = 1; n <= maxNum; n++) {
            if ((n & (1 << bit)) !== 0) card.push(n);
        }
        cards.push(card);
    }
}

// Render the current card as an 8x4 grid (column-major, as in your UI)
function renderCurrentCard() {
    numberGrid.innerHTML = '';
    let cardNumbers = cards[currentCardIdx];
    // Fill 8 columns × 4 rows (column-major order)
    let grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(''));
    let idx = 0;
    for (let c = 0; c < gridCols; c++) {
        for (let r = 0; r < gridRows; r++) {
            if (idx < cardNumbers.length) {
                grid[r][c] = cardNumbers[idx++];
            }
        }
    }
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const val = grid[r][c];
            const card = document.createElement('div');
            card.className = 'number-card';
            card.textContent = val ? val : '';
            numberGrid.appendChild(card);
        }
    }
}

function resetGame() {
    phase = 'start';
    currentCardIdx = 0;
    cardAnswers = [];
    userInput.value = '';
    userInput.disabled = false;
    instructions.innerHTML = 'Think of a number between 1 and 63. Type <b>yes</b> to start.';
    resultDiv.textContent = '';
    submitBtn.style.display = '';
    restartBtn.style.display = 'none';
    clearHighlights();
    generateCards();
    // Show the first card immediately so numbers are visible at the start
    renderCurrentCard();
}
restartBtn.onclick = resetGame;

function askCard() {
    if (currentCardIdx >= cards.length) {
        deduceNumber();
        return;
    }
    renderCurrentCard();
    instructions.innerHTML = `Is your number in <b>this card</b>? (Type yes or no and submit) <br><span style="font-size:0.95em;color:#888;">Card ${currentCardIdx + 1} of 6</span>`;
    userInput.value = '';
    userInput.disabled = false;
}

function deduceNumber() {
    let guessed = 0;
    for (let i = 0; i < cardAnswers.length; i++) {
        if (cardAnswers[i]) guessed += (1 << i);
    }
    numberGrid.innerHTML = '';
    if (guessed > 0 && guessed <= maxNum) {
        resultDiv.innerHTML = `Your number is: <span style="color:#2d8cf0">${guessed}</span> 🎉`;
    } else {
        resultDiv.innerHTML = `<span style="color:#e74c3c">Couldn't determine your number. Try again!</span>`;
    }
    instructions.innerHTML = 'Want to play again?';
    userInput.disabled = true;
    submitBtn.style.display = 'none';
    restartBtn.style.display = '';
}

// Accepts "yes", "y", "yeah", etc.
function isYes(input) {
    if (!input) return false;
    const yesWords = ['yes', 'y', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ya', 'yea'];
    return yesWords.includes(input.trim().toLowerCase());
}
function isNo(input) {
    if (!input) return false;
    const noWords = ['no', 'n', 'nope', 'nah', 'na'];
    return noWords.includes(input.trim().toLowerCase());
}

// Main submit logic
submitBtn.onclick = () => {
    const input = userInput.value.trim();
    if (phase === 'start') {
        if (isYes(input)) {
            phase = 'card';
            currentCardIdx = 0;
            cardAnswers = [];
            resultDiv.textContent = '';
            askCard(); // Show the first card immediately
        } else {
            resultDiv.textContent = 'Type "yes" to start the game.';
        }
    } else if (phase === 'card') {
        if (isYes(input)) {
            cardAnswers[currentCardIdx] = true;
            currentCardIdx++;
            askCard();
        } else if (isNo(input)) {
            cardAnswers[currentCardIdx] = false;
            currentCardIdx++;
            askCard();
        } else {
            resultDiv.textContent = 'Please type "yes" or "no".';
        }
    }
    userInput.value = '';
};

// Allow pressing Enter to submit
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') submitBtn.click();
});

// No highlight needed for this version
function clearHighlights() {}

// Initialize
resetGame();