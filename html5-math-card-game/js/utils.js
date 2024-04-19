// Import Three.js
import * as THREE from 'three';

// Utility to generate a random number between min and max
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility to shuffle an array (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Utility to create a new card element
function createCardElement(value) {
    let card = document.createElement('div');
    card.classList.add('card');
    card.textContent = value;
    card.draggable = true;
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('drop', handleCardDrop);
    card.addEventListener('dragover', handleDragOver);

    // Create a 3D card using Three.js
    const cardGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.2);
    const cardMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    cardMesh.position.set(0, 0, 0);
    card.appendChild(cardMesh.element);

    return card;
}

// Handle the start of dragging a card
function handleDragStart(event) {
    event.dataTransfer.setData('text', event.target.textContent);
    event.target.classList.add('dragging');

    // Animate the card in 3D when dragging starts
    const cardElement = event.target;
    const cardMesh = cardElement.querySelector('canvas').children[0];
    cardMesh.rotation.x = THREE.MathUtils.degToRad(10);
    cardMesh.rotation.y = THREE.MathUtils.degToRad(10);
    cardMesh.position.z = 0.5;
}

// Handle the card being dropped on the board
function handleCardDrop(event) {
    event.preventDefault();
    event.target.classList.remove('dragging');

    const cardElement = event.target;
    const cardMesh = cardElement.querySelector('canvas').children[0];
    cardMesh.rotation.x = 0;
    cardMesh.rotation.y = 0;
    cardMesh.position.z = 0;

    let droppedValue = parseInt(event.dataTransfer.getData('text'), 10);
    let targetValue = parseInt(event.target.textContent, 10);

    if (droppedValue === targetValue + 2) {
        event.target.textContent = droppedValue;
        event.target.classList.remove('incorrect');
        updateScore(score + 10); 
        if (isPlaying) {
            (player1Score < player2Score) ? player1Score++ : player2Score++;
            updatePlayerScores();
        }
    } else {
        event.target.classList.add('incorrect'); // Highlight incorrect card
    }
}

function handleDragOver(event) {
    event.preventDefault();
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');
}