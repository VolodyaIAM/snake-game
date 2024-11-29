class SnakeGame {
    constructor() {
        console.log('Initializing SnakeGame...');
        
        // Game elements
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('scoreValue');
        this.finalScoreElement = document.getElementById('finalScore');
        
        console.log('Canvas initialized:', this.canvas);
        
        // Screens
        this.menuScreen = document.getElementById('menuScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.highscoresScreen = document.getElementById('highscoresScreen');
        
        console.log('Screens initialized:', {
            menu: this.menuScreen,
            game: this.gameScreen,
            gameOver: this.gameOverScreen,
            highscores: this.highscoresScreen
        });
        
        // Settings
        this.difficulty = document.getElementById('difficulty');
        this.snakeColorSelect = document.getElementById('snakeColor');
        
        // Sound
        this.sounds = {
            eat: new Audio('https://assets.mixkit.co/active_storage/sfx/2198/2198-preview.mp3'),
            die: new Audio('https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3')
        };
        
        // Предзагрузка звуков
        Object.values(this.sounds).forEach(sound => {
            sound.load();
            // Установим громкость для всех звуков
            sound.volume = 0.5;
        });
        
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
        this.highScores = loadHighScores();
        
        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleTouchControls = this.handleTouchControls.bind(this);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show menu screen and initialize sound toggle
        this.showScreen('menu');
        this.updateSoundToggle();
        console.log('SnakeGame initialized');
    }
    
    setupCanvas() {
        console.log('Setting up canvas...');
        const size = Math.min(window.innerWidth - 40, 400);
        this.canvas.width = size;
        this.canvas.height = size;
        console.log('Canvas size set to:', size);
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Game controls
        document.addEventListener('keydown', this.handleKeyPress);
        
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const startBtn = document.getElementById('startBtn');
        
        console.log('Control buttons:', { upBtn, downBtn, leftBtn, rightBtn, startBtn });
        
        upBtn?.addEventListener('click', () => this.handleTouchControls('up'));
        downBtn?.addEventListener('click', () => this.handleTouchControls('down'));
        leftBtn?.addEventListener('click', () => this.handleTouchControls('left'));
        rightBtn?.addEventListener('click', () => this.handleTouchControls('right'));
        
        // Menu buttons
        startBtn?.addEventListener('click', () => {
            console.log('Start button clicked');
            this.startGame();
        });
        
        document.getElementById('highscoresBtn')?.addEventListener('click', () => this.showHighScores());
        document.getElementById('backToMenuBtn')?.addEventListener('click', () => this.showScreen('menu'));
        document.getElementById('playAgainBtn')?.addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn')?.addEventListener('click', () => this.showScreen('menu'));
        document.getElementById('saveScoreBtn')?.addEventListener('click', () => this.saveHighScore());
        
        // Sound toggle
        document.getElementById('soundToggle')?.addEventListener('click', () => this.toggleSound());
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
        
        console.log('Event listeners setup complete');
    }
    
    showScreen(screen) {
        console.log('Showing screen:', screen);
        
        // Remove active class from all screens
        this.menuScreen?.classList.remove('active-screen');
        this.gameScreen?.classList.remove('active-screen');
        this.gameOverScreen?.classList.remove('active-screen');
        this.highscoresScreen?.classList.remove('active-screen');
        
        // Add active class to the selected screen
        switch(screen) {
            case 'menu':
                this.menuScreen?.classList.add('active-screen');
                break;
            case 'game':
                this.gameScreen?.classList.add('active-screen');
                break;
            case 'gameOver':
                this.gameOverScreen?.classList.add('active-screen');
                break;
            case 'highscores':
                this.highscoresScreen?.classList.add('active-screen');
                break;
        }
        
        console.log('Screen visibility updated');
    }
    
    updateSoundToggle() {
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
            soundToggle.style.opacity = '0.8';
            soundToggle.title = this.soundEnabled ? 'Выключить звук' : 'Включить звук';
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateSoundToggle();
        // Сохраняем состояние звука
        localStorage.setItem('snakeSoundEnabled', this.soundEnabled);
    }
    
    playSound(soundName) {
        if (this.soundEnabled && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(() => {});
            console.log('Playing sound:', soundName);
        }
    }
    
    handleKeyPress(event) {
        const key = event.key;
        if (key === 'ArrowUp' && this.direction !== 'down') {
            this.nextDirection = 'up';
            console.log('Key pressed: up');
        }
        if (key === 'ArrowDown' && this.direction !== 'up') {
            this.nextDirection = 'down';
            console.log('Key pressed: down');
        }
        if (key === 'ArrowLeft' && this.direction !== 'right') {
            this.nextDirection = 'left';
            console.log('Key pressed: left');
        }
        if (key === 'ArrowRight' && this.direction !== 'left') {
            this.nextDirection = 'right';
            console.log('Key pressed: right');
        }
    }
    
    handleTouchControls(direction) {
        if (direction === 'up' && this.direction !== 'down') {
            this.nextDirection = 'up';
            console.log('Touch control: up');
        }
        if (direction === 'down' && this.direction !== 'up') {
            this.nextDirection = 'down';
            console.log('Touch control: down');
        }
        if (direction === 'left' && this.direction !== 'right') {
            this.nextDirection = 'left';
            console.log('Touch control: left');
        }
        if (direction === 'right' && this.direction !== 'left') {
            this.nextDirection = 'right';
            console.log('Touch control: right');
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
        console.log('Food generated:', food);
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
        
        console.log('Snake moved:', head);
        
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
            // Воспроизведение звука еды
            if (this.soundEnabled) {
                this.sounds.eat.currentTime = 0;
                this.sounds.eat.play().catch(err => {
                    console.log('Error playing eat sound:', err);
                });
            }
            console.log('Snake ate food:', this.score);
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
        
        console.log('Game drawn');
    }
    
    update() {
        this.moveSnake();
        this.draw();
    }
    
    startGame() {
        // Останавливаем все звуки
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        
        console.log('Starting game...');
        
        // Reset game state
        const difficulty = this.difficultySettings[this.difficulty.value];
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameSpeed = difficulty.speed;
        this.food = this.generateFood();
        
        console.log('Game state reset:', {
            snake: this.snake,
            direction: this.direction,
            speed: this.gameSpeed
        });
        
        // Clear previous game loop
        if (this.gameLoop) {
            console.log('Clearing previous game loop');
            clearInterval(this.gameLoop);
        }
        
        // Show game screen
        this.showScreen('game');
        
        // Start new game loop
        console.log('Starting game loop with speed:', this.gameSpeed);
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        
        // Initial draw
        this.draw();
        console.log('Game started');
    }
    
    gameOver() {
        if (this.soundEnabled) {
            this.sounds.die.currentTime = 0;
            this.sounds.die.play().catch(err => {
                console.log('Error playing die sound:', err);
            });
        }
        clearInterval(this.gameLoop);
        this.finalScoreElement.textContent = this.score;
        this.showScreen('gameOver');
        console.log('Game over:', this.score);
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
            
            // Save to IndexedDB and localStorage
            saveHighScores(this.highScores);
            
            // Show high scores screen
            this.showHighScores();
            console.log('High score saved:', this.highScores);
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
        console.log('High scores shown');
    }
}

function saveHighScores(scores) {
    localStorage.setItem('snakeHighScores', JSON.stringify(scores));
    // Добавляем сохранение в IndexedDB для постоянного хранения
    const request = indexedDB.open('SnakeGameDB', 1);
    
    request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('highScores')) {
            db.createObjectStore('highScores', { keyPath: 'id' });
        }
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['highScores'], 'readwrite');
        const store = transaction.objectStore('highScores');
        store.put({ id: 1, scores: scores });
    };
}

function loadHighScores() {
    // Сначала пробуем загрузить из IndexedDB
    const request = indexedDB.open('SnakeGameDB', 1);
    
    request.onerror = () => {
        // Если не получилось, загружаем из localStorage
        const scores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];
        return scores;
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['highScores'], 'readonly');
        const store = transaction.objectStore('highScores');
        const getRequest = store.get(1);
        
        getRequest.onsuccess = () => {
            if (getRequest.result) {
                return getRequest.result.scores;
            } else {
                // Если в IndexedDB ничего нет, загружаем из localStorage
                const scores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];
                return scores;
            }
        };
    };

    // Возвращаем данные из localStorage как запасной вариант
    return JSON.parse(localStorage.getItem('snakeHighScores')) || [];
}

// Initialize game when page loads
window.onload = () => {
    new SnakeGame();
};
