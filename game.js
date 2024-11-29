class SnakeGame {
    constructor() {
        // Game elements
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('scoreValue');
        this.finalScoreElement = document.getElementById('finalScore');
        
        // Screens
        this.menuScreen = document.getElementById('menuScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.highscoresScreen = document.getElementById('highscoresScreen');
        
        // Settings
        this.difficulty = document.getElementById('difficulty');
        this.snakeColorSelect = document.getElementById('snakeColor');
        
        // Sound
        this.sounds = {
            eat: new Audio('data:audio/wav;base64,UklGRl4aAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToaAAAAAAEA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
            die: new Audio('data:audio/wav;base64,UklGRl4aAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToaAAAAAAEA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
            turn: new Audio('data:audio/wav;base64,UklGRl4aAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToaAAAAAAEA/v8CAP//AQAAAP7/AgD//wEAAAD+/wIA//8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
        };
        this.soundEnabled = true;
        
        // Set canvas size
        this.setupCanvas();
        
        // Game settings
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.gameSpeed = 150;
        this.difficultySettings = {
            easy: { speed: 150, scoreMultiplier: 1 },
            medium: { speed: 100, scoreMultiplier: 2 },
            hard: { speed: 70, scoreMultiplier: 3 }
        };
        
        // High scores
        this.highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];
        
        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleTouchControls = this.handleTouchControls.bind(this);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show menu screen
        this.showScreen('menu');
    }
    
    setupCanvas() {
        const size = Math.min(window.innerWidth - 40, 400);
        this.canvas.width = size;
        this.canvas.height = size;
    }
    
    setupEventListeners() {
        // Game controls
        document.addEventListener('keydown', this.handleKeyPress);
        document.getElementById('upBtn').addEventListener('click', () => this.handleTouchControls('up'));
        document.getElementById('downBtn').addEventListener('click', () => this.handleTouchControls('down'));
        document.getElementById('leftBtn').addEventListener('click', () => this.handleTouchControls('left'));
        document.getElementById('rightBtn').addEventListener('click', () => this.handleTouchControls('right'));
        
        // Menu buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('highscoresBtn').addEventListener('click', () => this.showHighScores());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showScreen('menu'));
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showScreen('menu'));
        document.getElementById('saveScoreBtn').addEventListener('click', () => this.saveHighScore());
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
    }
    
    showScreen(screen) {
        // Remove active class from all screens
        this.menuScreen.classList.remove('active-screen');
        this.gameScreen.classList.remove('active-screen');
        this.gameOverScreen.classList.remove('active-screen');
        this.highscoresScreen.classList.remove('active-screen');
        
        // Add active class to the selected screen
        switch(screen) {
            case 'menu':
                this.menuScreen.classList.add('active-screen');
                break;
            case 'game':
                this.gameScreen.classList.add('active-screen');
                break;
            case 'gameOver':
                this.gameOverScreen.classList.add('active-screen');
                break;
            case 'highscores':
                this.highscoresScreen.classList.add('active-screen');
                break;
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundToggle = document.getElementById('soundToggle');
        soundToggle.textContent = this.soundEnabled ? '🔊' : '🔈';
    }
    
    playSound(soundName) {
        if (this.soundEnabled) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(() => {});
        }
    }
    
    handleKeyPress(event) {
        const key = event.key;
        if (key === 'ArrowUp' && this.direction !== 'down') {
            this.nextDirection = 'up';
            this.playSound('turn');
        }
        if (key === 'ArrowDown' && this.direction !== 'up') {
            this.nextDirection = 'down';
            this.playSound('turn');
        }
        if (key === 'ArrowLeft' && this.direction !== 'right') {
            this.nextDirection = 'left';
            this.playSound('turn');
        }
        if (key === 'ArrowRight' && this.direction !== 'left') {
            this.nextDirection = 'right';
            this.playSound('turn');
        }
    }
    
    handleTouchControls(direction) {
        if (direction === 'up' && this.direction !== 'down') {
            this.nextDirection = 'up';
            this.playSound('turn');
        }
        if (direction === 'down' && this.direction !== 'up') {
            this.nextDirection = 'down';
            this.playSound('turn');
        }
        if (direction === 'left' && this.direction !== 'right') {
            this.nextDirection = 'left';
            this.playSound('turn');
        }
        if (direction === 'right' && this.direction !== 'left') {
            this.nextDirection = 'right';
            this.playSound('turn');
        }
    }
    
    generateFood() {
        const gridWidth = this.canvas.width / this.gridSize;
        const gridHeight = this.canvas.height / this.gridSize;
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }
    
    moveSnake() {
        this.direction = this.nextDirection;
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check for collision with walls
        if (head.x < 0 || head.y < 0 || 
            head.x >= this.canvas.width / this.gridSize || 
            head.y >= this.canvas.height / this.gridSize) {
            this.gameOver();
            return;
        }
        
        // Check for collision with self
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            const difficulty = this.difficultySettings[this.difficulty.value];
            this.score += 10 * difficulty.scoreMultiplier;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
            this.playSound('eat');
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        const snakeColor = this.snakeColorSelect.value;
        this.ctx.fillStyle = snakeColor;
        this.snake.forEach((segment, index) => {
            // Draw body segments slightly smaller for visual effect
            const size = index === 0 ? this.gridSize - 1 : this.gridSize - 2;
            const offset = index === 0 ? 0.5 : 1;
            this.ctx.fillRect(
                segment.x * this.gridSize + offset,
                segment.y * this.gridSize + offset,
                size,
                size
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }
    
    update() {
        this.moveSnake();
        this.draw();
    }
    
    startGame() {
        // Reset game state
        const difficulty = this.difficultySettings[this.difficulty.value];
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameSpeed = difficulty.speed;
        this.food = this.generateFood();
        
        // Clear previous game loop
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        // Show game screen
        this.showScreen('game');
        
        // Start new game loop
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }
    
    gameOver() {
        this.playSound('die');
        clearInterval(this.gameLoop);
        this.finalScoreElement.textContent = this.score;
        this.showScreen('gameOver');
    }
    
    saveHighScore() {
        const playerName = document.getElementById('playerName').value.trim();
        if (playerName) {
            this.highScores.push({
                name: playerName,
                score: this.score,
                difficulty: this.difficulty.value
            });
            
            // Sort and keep only top 10 scores
            this.highScores.sort((a, b) => b.score - a.score);
            this.highScores = this.highScores.slice(0, 10);
            
            // Save to localStorage
            localStorage.setItem('snakeHighScores', JSON.stringify(this.highScores));
            
            // Show high scores screen
            this.showHighScores();
        }
    }
    
    showHighScores() {
        const highscoresList = document.getElementById('highscoresList');
        highscoresList.innerHTML = '';
        
        this.highScores.forEach((score, index) => {
            const scoreElement = document.createElement('div');
            scoreElement.className = 'highscore-item';
            scoreElement.innerHTML = `
                <span>${index + 1}. ${score.name} (${score.difficulty})</span>
                <span>${score.score}</span>
            `;
            highscoresList.appendChild(scoreElement);
        });
        
        this.showScreen('highscores');
    }
}

// Initialize game when page loads
window.onload = () => {
    new SnakeGame();
};
