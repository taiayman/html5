let gameTimer;
let score = 0;
let isPlaying = false;
let isMusicPlaying = true;
let player1Score = 0;
let player2Score = 0;
const gameTime = 60; // Game duration in seconds

// DOM elements
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

document.getElementById('play-offline').addEventListener('click', function() {
    document.getElementById('start-page').classList.add('hidden'); // Hide the start page
    document.getElementById('game-page').classList.remove('hidden'); // Show the game page
});

document.getElementById('play-online').addEventListener('click', function() {
    document.getElementById('start-page').classList.add('hidden'); // Hide the start page
    document.getElementById('game-page').classList.remove('hidden'); // Show the game page
});


// Initial setup
function initializeGame() {
    // Show the start page by default
    startPage.classList.remove('hidden');
    gamePage.classList.add('hidden');

    // Setup buttons to start the game
    playOfflineButton.addEventListener('click', startOfflineGame);
    playOnlineButton.addEventListener('click', startOnlineGame);

    // Setup the music toggle button
    toggleMusicButton.addEventListener('click', toggleMusic);
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

    setupGameBoard(increment);  // Pass the increment value
    gamePage.classList.remove('hidden');
    document.getElementById('player-info').classList.add('hidden');
}


// Function to start the online game
function startOnlineGame() {
    // Implement online game logic here
    alert('Online game mode is not yet implemented.');
    document.getElementById('player-info').classList.remove('hidden');

}

// Function to start the timer
function startTimer(duration) {
    let startTime = Date.now();

    // Update the timer every second
    gameTimer = setInterval(function () {
        let elapsedTime = Date.now() - startTime;
        let timeLeft = duration - Math.floor(elapsedTime / 1000);
        if (timeLeft >= 0) {
            timerDisplay.textContent = formatTime(timeLeft);
        } else {
            endGame();
        }
    }, 1000);
}

// Function to end the game
// Function to end the game
function endGame() {
    isPlaying = false;
    clearInterval(gameTimer);

    // Determine the winner
    let winner = (player1Score > player2Score) ? 'Player 1' : 'Player 2';
    if (player1Score === player2Score) {
        winner = 'It\'s a tie!';
    }

    // Create the popup element
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Time's up!</h2>
            <p>Your final score is: ${score}</p>
            <p>${winner} wins!</p>
            <button id="play-again-btn">Play Again</button>
            <button id="back-to-home-btn">Back to Home</button>
        </div>
    `;

    // Add the popup to the document body
    document.body.appendChild(popup);

    // Add event listeners to the buttons
    const playAgainBtn = document.getElementById('play-again-btn');
    const backToHomeBtn = document.getElementById('back-to-home-btn');

    playAgainBtn.addEventListener('click', () => {
        resetGameState();
        popup.remove();
        startOfflineGame();
    });

    backToHomeBtn.addEventListener('click', () => {
        resetGameState();
        popup.remove();
        startPage.classList.remove('hidden');
    });
}

// Reset game state for a new game
function resetGameState() {
    startPage.classList.remove('hidden');
    gamePage.classList.add('hidden');
    timerDisplay.textContent = '01:00';
    updateScore(0);
    player1Score = 0;
    player2Score = 0;
    updatePlayerScores();

    // Clear the game board and reload the game
    gameBoard.innerHTML = '';
    playersHand.innerHTML = '';
    setupGameBoard();  // Reload the game board and players hand to start fresh
}

function loadPlayersCards(boardCardValues, increment) {
    playersHand.innerHTML = ''; // Clear the existing content of the players-hand div

    // Shuffle the board card values to randomize which ones will have corresponding player cards
    shuffleArray(boardCardValues);

    // Select only the first 6 unique values from the shuffled board card values for the player's hand
    let selectedValues = new Set(boardCardValues.slice(0, 6));

    // Ensure that there are exactly 6 unique values
    while (selectedValues.size < 6) {
        let randomValue = getRandomNumber(1, 50 - increment);
        if (!selectedValues.has(randomValue)) {
            selectedValues.add(randomValue);
        }
    }

    // Create and append card elements for the selected values
    selectedValues.forEach(value => {
        let correctValue = value + increment; // Calculate the correct card value
        let card = createCardElement(correctValue, true); // Mark as player card
        playersHand.appendChild(card);
    });
}

function getUserConfiguration() {
    const increment = parseInt(prompt("Enter the increment value (2, 4, ..., 50):"));
    if (isNaN(increment) || increment < 2 || increment > 50 || increment % 2 !== 0) {
        alert("Invalid increment value. Using the default value of 2.");
        return 2;
    }
    return increment;
}

function setupGameBoard(increment) {
    gameBoard.innerHTML = '';
    let boardCardValues = [];
    for (let i = 0; i < 4; i++) {
        boardCardValues.push(getRandomNumber(1, 50 - increment));  // Ensuring room for increment
    }

    shuffleArray(boardCardValues);

    boardCardValues.forEach(value => {
        let card = createCardElement(value);  // These are board cards, not draggable
        gameBoard.appendChild(card);
    });

    // Load 6 player cards matching a subset of the board cards
    loadPlayersCards(boardCardValues, increment);

    // Add drop events to the board cards after they are added to the DOM
    addDropEventsToBoardCards(increment);
}

// Update the score display
function updateScore(newScore) {
    score = newScore;
    scoreDisplay.textContent = 'Score: ' + score;
}

// Update the player scores display
function updatePlayerScores() {
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;
}

// Toggle the music
function toggleMusic() {
    if (isMusicPlaying) {
        // Stop the music
        isMusicPlaying = false;
        toggleMusicButton.textContent = '🔇';
    } else {
        // Play the music
        isMusicPlaying = true;
        toggleMusicButton.textContent = '🔊';
    }
}

// Utility functions
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCardElement(value, isPlayerCard = false) {
    let card = document.createElement('div');
    card.classList.add('card');
    card.textContent = value;

    if (isPlayerCard) {
        // Only player cards are draggable and have dragstart event
        card.draggable = true;
        card.addEventListener('dragstart', handleDragStart);
    }

    return card;
}



function addDropEventsToBoardCards(increment) {
    Array.from(gameBoard.children).forEach(card => {
        card.addEventListener('drop', (event) => handleCardDrop(event, increment));
        card.addEventListener('dragover', handleDragOver);
    });
}

function handleCardDrop(event, increment) {
    event.preventDefault();
    event.stopPropagation(); 
  
    let droppedValue = parseInt(event.dataTransfer.getData('text'), 10);
    let targetValue = parseInt(event.target.textContent, 10);
  
    if (droppedValue === targetValue + increment) {
      let scoreToAdd = 10; 
  
      updateScore(score + scoreToAdd); 
  
      if (score % 40 === 0) {  
        setupGameBoard(increment); // Reload for the next "level"
        // Determine which player earned the points and update their score
        if (event.target.parentNode === gameBoard) {
          player1Score += scoreToAdd;
        } else if (event.target.parentNode === playersHand) {
          player2Score += scoreToAdd;
        }
        updatePlayerScores(); // Update the player score display
      }
  
      event.target.textContent = droppedValue; 
      event.target.classList.remove('incorrect');
      event.target.classList.add('correct');
  
      let playedCard = document.querySelector('.card.dragging');
      playedCard.classList.add('played');
  
      playedCard.addEventListener('animationend', () => {
        playedCard.remove(); 
      });
    } else {
      event.target.classList.add('incorrect');
    }
  }

function handleDragStart(event) {
    // Add 'dragging' class to the card being dragged
    event.target.classList.add('dragging');
    event.dataTransfer.setData('text', event.target.textContent);
}


function handleDragOver(event) {
    event.preventDefault();
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');
}

// Call the initialize function when the window is loaded
window.addEventListener('load', initializeGame);