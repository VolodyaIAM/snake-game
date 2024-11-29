class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('scoreValue');
        
        // Set canvas size based on device size
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
        
        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleTouchControls = this.handleTouchControls.bind(this);
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupCanvas() {
        // Make canvas size responsive but maintain aspect ratio
        const size = Math.min(window.innerWidth - 40, 400);
        this.canvas.width = size;
        this.canvas.height = size;
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Touch controls
        document.getElementById('upBtn').addEventListener('click', () => this.handleTouchControls('up'));
        document.getElementById('downBtn').addEventListener('click', () => this.handleTouchControls('down'));
        document.getElementById('leftBtn').addEventListener('click', () => this.handleTouchControls('left'));
        document.getElementById('rightBtn').addEventListener('click', () => this.handleTouchControls('right'));
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
    }
    
    handleKeyPress(event) {
        const key = event.key;
        if (key === 'ArrowUp' && this.direction !== 'down') this.nextDirection = 'up';
        if (key === 'ArrowDown' && this.direction !== 'up') this.nextDirection = 'down';
        if (key === 'ArrowLeft' && this.direction !== 'right') this.nextDirection = 'left';
        if (key === 'ArrowRight' && this.direction !== 'left') this.nextDirection = 'right';
    }
    
    handleTouchControls(direction) {
        if (direction === 'up' && this.direction !== 'down') this.nextDirection = 'up';
        if (direction === 'down' && this.direction !== 'up') this.nextDirection = 'down';
        if (direction === 'left' && this.direction !== 'right') this.nextDirection = 'left';
        if (direction === 'right' && this.direction !== 'left') this.nextDirection = 'right';
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
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
            // Increase speed slightly
            if (this.gameSpeed > 50) {
                this.gameSpeed -= 2;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            }
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
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
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameSpeed = 150;
        this.food = this.generateFood();
        
        // Clear previous game loop if exists
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        // Start new game loop
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
}

// Initialize game when page loads
window.onload = () => {
    new SnakeGame();
};
