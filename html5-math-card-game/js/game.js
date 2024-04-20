let gameTimer;
let score = 0;
let isPlaying = false;
let isMusicPlaying = true;
let player1Score = 0;
let player2Score = 0;
const gameTime = 60;

const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2ScoreDisplay = document.getElementById('player2-score');
const gameBoard = document.getElementById('game-board');
const playersHand = document.getElementById('players-hand');
const startPage = document.getElementById('start-page');
const gamePage = document.getElementById('game-page');
const playOfflineButton = document.getElementById('play-offline');
const playOnlineButton = document.getElementById('play-online');
const toggleMusicButton = document.getElementById('toggle-music');

let draggedCard = null;
let selectedCard = null;

function handleDragStart(event) {
    if (window.innerWidth > 768) {
        draggedCard = event.target;
        event.dataTransfer.setData('text', event.target.textContent);
    }
}

function handleTouchStart(event) {
    draggedCard = event.target;
    event.dataTransfer = { data: {} };
    event.dataTransfer.setData('text', event.target.textContent);
}

function handleCardDrop(event, cardValue) {
    const droppedValue = cardValue || parseInt(event.dataTransfer.getData('text'), 10);
    const targetValue = parseInt(event.target.textContent, 10);
    const increment = getUserConfiguration();

    if (droppedValue === targetValue + increment) {
        const scoreToAdd = 10;
        updateScore(score + scoreToAdd);

        if (score % 40 === 0) {
            setupGameBoard(increment);
        }

        event.target.textContent = droppedValue;
        event.target.classList.remove('incorrect');
        event.target.classList.add('correct');

        if (draggedCard) {
            draggedCard.classList.add('played');
            draggedCard.addEventListener('animationend', () => {
                draggedCard.remove();
                draggedCard = null;
            });
        }
    } else {
        event.target.classList.add('incorrect');
    }
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    handleCardDrop(event);
}

function setupCardEvents() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('touchstart', handleTouchStart);
    });
}

function initializeGame() {
    startPage.classList.remove('hidden');
    gamePage.classList.add('hidden');

    playOfflineButton.addEventListener('click', startOfflineGame);
    playOnlineButton.addEventListener('click', startOnlineGame);
    toggleMusicButton.addEventListener('click', toggleMusic);

    setupCardEvents();

    if (window.innerWidth <= 768) {
        setupMobileEvents();
    }
}

function startOfflineGame() {
    const increment = getUserConfiguration();

    startPage.classList.add('hidden');
    gamePage.classList.remove('hidden');

    isPlaying = true;
    score = 0;
    updateScore(0);
    player1Score = 0;
    player2Score = 0;
    updatePlayerScores();
    startTimer(gameTime);

    setupGameBoard(increment);
    gamePage.classList.remove('hidden');
    document.getElementById('player-info').classList.add('hidden');
}

function startOnlineGame() {
    alert('Online game mode is not yet implemented.');
    document.getElementById('player-info').classList.remove('hidden');
}

function startTimer(duration) {
    const startTime = Date.now();

    gameTimer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const timeLeft = duration - Math.floor(elapsedTime / 1000);
        if (timeLeft >= 0) {
            timerDisplay.textContent = formatTime(timeLeft);
        } else {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameTimer);

    document.querySelectorAll('.popup').forEach(popup => popup.remove());

    let winner = 'It\'s a tie!';
    if (player1Score > player2Score) winner = 'Player 1 wins!';
    else if (player2Score > player1Score) winner = 'Player 2 wins!';

    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Time's up!</h2>
            <p>Your final score is: ${score}</p>
            <p>${winner}</p>
            <button id="play-again-btn">Play Again</button>
            <button id="back-to-home-btn">Back to Home</button>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById('play-again-btn').addEventListener('click', () => {
        resetGameState();
        popup.remove();
        startOfflineGame();
    });

    document.getElementById('back-to-home-btn').addEventListener('click', () => {
        resetGameState();
        popup.remove();
        startPage.classList.remove('hidden');
        gamePage.classList.add('hidden');
    });
}

function resetGameState() {
    timerDisplay.textContent = '01:00';
    updateScore(0);
    player1Score = 0;
    player2Score = 0;
    updatePlayerScores();

    gameBoard.innerHTML = '';
    playersHand.innerHTML = '';
}

function handleTouchMove(event) {
    const touch = event.targetTouches[0];
    const card = document.querySelector('.dragging');
    card.style.left = `${touch.pageX - card.offsetWidth / 2}px`;
    card.style.top = `${touch.pageY - card.offsetHeight / 2}px`;
    event.preventDefault();
}

function handleTouchEnd(event) {
    const card = document.querySelector('.dragging');
    if (card) {
        card.style.left = 'initial';
        card.style.top = 'initial';
        card.classList.remove('dragging');

        const target = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        if (target && target.classList.contains('drop-zone')) {
            handleCardDrop(target, parseInt(card.textContent));
        }
    }
}

function setupTouchEvents() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('touchstart', handleTouchStart);
        card.addEventListener('touchmove', handleTouchMove);
        card.addEventListener('touchend', handleTouchEnd);
    });
}

function loadPlayersCards(boardCardValues, increment) {
    playersHand.innerHTML = '';

    shuffleArray(boardCardValues);

    const selectedValues = new Set(boardCardValues.slice(0, 5));

    while (selectedValues.size < 5) {
        const randomValue = getRandomNumber(1, 50 - increment);
        if (!selectedValues.has(randomValue)) {
            selectedValues.add(randomValue);
        }
    }

    selectedValues.forEach(value => {
        const correctValue = value + increment;
        const card = createCardElement(correctValue, true);
        playersHand.appendChild(card);
    });
}

function getUserConfiguration() {
    const increment = parseInt(prompt("Enter the increment value (2, 4, ..., 50):"));
    if (isNaN(increment) || increment < 2 || increment > 50|| increment % 2 !== 0) {
        alert("Invalid increment value. Using the default value of 2.");
        return 2;
    }
    return increment;
 }
 
 function setupGameBoard(increment) {
    gameBoard.innerHTML = '';
    const boardCardValues = [];
    for (let i = 0; i < 4; i++) {
        boardCardValues.push(getRandomNumber(1, 50 - increment));
    }
 
    shuffleArray(boardCardValues);
 
    boardCardValues.forEach(value => {
        const card = createCardElement(value);
        gameBoard.appendChild(card);
    });
 
    loadPlayersCards(boardCardValues, increment);
    addDropEventsToBoardCards(increment);
 }
 
 function updateScore(newScore) {
    score = newScore;
    scoreDisplay.textContent = `Score: ${score}`;
 }
 
 function updatePlayerScores() {
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;
 }
 
 function toggleMusic() {
    isMusicPlaying = !isMusicPlaying;
    toggleMusicButton.textContent = isMusicPlaying ? '🔊' : '🔇';
 }
 
 function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
 }
 
 function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
 }
 
 function createCardElement(value, isPlayerCard = false) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = value;
 
    if (isPlayerCard) {
        card.draggable = true;
        card.addEventListener('dragstart', handleDragStart);
    }
 
    return card;
 }
 
 function addDropEventsToBoardCards(increment) {
    Array.from(gameBoard.children).forEach(card => {
        card.addEventListener('drop', event => handleCardDrop(event, increment));
        card.addEventListener('dragover', handleDragOver);
    });
 }
 
 function handleCardDrop(event, increment) {
    event.preventDefault();
    event.stopPropagation();
 
    const droppedValue = parseInt(event.dataTransfer.getData('text'), 10);
    const targetValue = parseInt(event.target.textContent, 10);
 
    if (droppedValue === targetValue + increment) {
        const scoreToAdd = 10;
 
        updateScore(score + scoreToAdd);
 
        if (score % 40 === 0) {
            setupGameBoard(increment);
            if (event.target.parentNode === gameBoard) {
                player1Score += scoreToAdd;
            } else if (event.target.parentNode === playersHand) {
                player2Score += scoreToAdd;
            }
            updatePlayerScores();
        }
 
        event.target.textContent = droppedValue;
        event.target.classList.remove('incorrect');
        event.target.classList.add('correct');
 
        const playedCard = document.querySelector('.card.dragging');
        playedCard.classList.add('played');
 
        playedCard.addEventListener('animationend', () => {
            playedCard.remove();
        });
    } else {
        event.target.classList.add('incorrect');
    }
 }
 
 function handleDragStart(event) {
    if (window.innerWidth > 768) {
        event.target.classList.add('dragging');
        event.dataTransfer.setData('text', event.target.textContent);
    }
 }
 
 function handleDragOver(event) {
    event.preventDefault();
 }
 
 function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
 }
 
 function setupMobileEvents() {
    const cards = document.querySelectorAll('#players-hand .card');
    cards.forEach(card => {
        card.addEventListener('click', function(event) {
            handleCardSelection(event.target);
        });
    });
 
    const gameSlots = document.querySelectorAll('#game-board .slot');
    gameSlots.forEach(slot => {
        slot.addEventListener('click', function(event) {
            if (selectedCard) {
                handleCardPlacement(event.target);
            }
        });
    });
 }
 
 function handleCardSelection(card) {
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }
 
    selectedCard = card;
    selectedCard.classList.add('selected');
 }
 
 function handleCardPlacement(target) {
    const increment = getUserConfiguration();
    const targetValue = parseInt(target.textContent, 10);
    const cardValue = parseInt(selectedCard.textContent, 10);
 
    if (cardValue === targetValue + increment) {
        updateScore(score + 10);
        target.textContent = cardValue;
        selectedCard.remove();
        resetSelectedCard();
    } else {
        console.log('Incorrect placement');
    }
 }
 
 function resetSelectedCard() {
    if (selectedCard) {
        selectedCard.classList.remove('selected');
        selectedCard = null;
    }
 }
 
 function getUserConfiguration() {
    return 2; // Default increment if none is set
 }
 
 window.addEventListener('DOMContentLoaded', initializeGame);
