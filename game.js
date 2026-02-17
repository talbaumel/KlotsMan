// Game Configuration
const CELL_SIZE = 20;
const ROWS = 31;
const COLS = 28;

// Game States
const GAME_STATE = {
    READY: 'ready',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    WON: 'won'
};

// Directions
const DIRECTION = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

// Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = GAME_STATE.READY;
        this.score = 0;
        this.lives = 3;
        
        // Initialize game elements
        this.initMaze();
        this.player = new Player(14, 23);
        this.ghosts = [
            new Ghost(12, 14, '#FF0000', 'red'),    // Red ghost
            new Ghost(14, 14, '#FFB8FF', 'pink'),   // Pink ghost
            new Ghost(13, 15, '#00FFFF', 'cyan'),   // Cyan ghost
            new Ghost(15, 15, '#FFB852', 'orange')  // Orange ghost
        ];
        
        this.setupEventListeners();
        this.lastTime = 0;
        this.updateUI();
        this.draw();
    }
    
    initMaze() {
        // 1 = wall, 0 = empty, 2 = dot, 3 = power pellet
        this.maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
            [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
            [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.totalDots = 0;
        this.dotsEaten = 0;
        for (let row of this.maze) {
            for (let cell of row) {
                if (cell === 2 || cell === 3) this.totalDots++;
            }
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.state === GAME_STATE.READY || this.state === GAME_STATE.GAME_OVER || this.state === GAME_STATE.WON) {
                    this.start();
                }
            }
            
            if (this.state === GAME_STATE.PLAYING) {
                switch(e.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        e.preventDefault();
                        this.player.setNextDirection(DIRECTION.UP);
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        e.preventDefault();
                        this.player.setNextDirection(DIRECTION.DOWN);
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        e.preventDefault();
                        this.player.setNextDirection(DIRECTION.LEFT);
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        e.preventDefault();
                        this.player.setNextDirection(DIRECTION.RIGHT);
                        break;
                }
            }
        });
    }
    
    start() {
        this.state = GAME_STATE.PLAYING;
        this.score = 0;
        this.lives = 3;
        this.dotsEaten = 0;
        this.initMaze();
        this.player.reset(14, 23);
        this.ghosts.forEach((ghost, i) => {
            const positions = [{x: 12, y: 14}, {x: 14, y: 14}, {x: 13, y: 15}, {x: 15, y: 15}];
            ghost.reset(positions[i].x, positions[i].y);
        });
        this.updateUI();
        this.hideStatusMessage();
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (this.state !== GAME_STATE.PLAYING) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update player
        this.player.update(deltaTime, this.maze);
        
        // Check dot collection
        const playerCell = this.maze[Math.floor(this.player.y)][Math.floor(this.player.x)];
        if (playerCell === 2) {
            this.maze[Math.floor(this.player.y)][Math.floor(this.player.x)] = 0;
            this.score += 10;
            this.dotsEaten++;
            this.updateUI();
        } else if (playerCell === 3) {
            this.maze[Math.floor(this.player.y)][Math.floor(this.player.x)] = 0;
            this.score += 50;
            this.dotsEaten++;
            this.player.powerMode = true;
            this.player.powerModeTime = 10;
            this.ghosts.forEach(ghost => ghost.scared = true);
            this.updateUI();
        }
        
        // Update power mode timer
        if (this.player.powerMode) {
            this.player.powerModeTime -= deltaTime;
            if (this.player.powerModeTime <= 0) {
                this.player.powerMode = false;
                this.ghosts.forEach(ghost => ghost.scared = false);
            }
        }
        
        // Update ghosts
        this.ghosts.forEach(ghost => {
            ghost.update(deltaTime, this.maze, this.player);
            
            // Check collision with player
            if (this.checkCollision(this.player, ghost)) {
                if (this.player.powerMode && ghost.scared) {
                    // Eat ghost
                    this.score += 200;
                    ghost.reset(14, 14);
                    this.updateUI();
                } else if (!ghost.scared) {
                    // Player dies
                    this.lives--;
                    this.updateUI();
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetPositions();
                    }
                }
            }
        });
        
        // Check win condition
        if (this.dotsEaten >= this.totalDots) {
            this.win();
        }
    }
    
    checkCollision(entity1, entity2) {
        const distance = Math.sqrt(
            Math.pow(entity1.x - entity2.x, 2) + 
            Math.pow(entity1.y - entity2.y, 2)
        );
        return distance < 0.6;
    }
    
    resetPositions() {
        this.player.reset(14, 23);
        this.ghosts.forEach((ghost, i) => {
            const positions = [{x: 12, y: 14}, {x: 14, y: 14}, {x: 13, y: 15}, {x: 15, y: 15}];
            ghost.reset(positions[i].x, positions[i].y);
        });
        this.state = GAME_STATE.PLAYING;
    }
    
    gameOver() {
        this.state = GAME_STATE.GAME_OVER;
        this.showStatusMessage('Game Over!<br>Press SPACE to Restart');
    }
    
    win() {
        this.state = GAME_STATE.WON;
        this.showStatusMessage('You Win!<br>Press SPACE to Play Again');
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze
        this.drawMaze();
        
        // Draw ghosts
        this.ghosts.forEach(ghost => ghost.draw(this.ctx));
        
        // Draw player (on top)
        this.player.draw(this.ctx);
    }
    
    drawMaze() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = this.maze[row][col];
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;
                
                if (cell === 1) {
                    // Wall
                    this.ctx.fillStyle = '#2121DE';
                    this.ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                    this.ctx.strokeStyle = '#4848FF';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                } else if (cell === 2) {
                    // Dot
                    this.ctx.fillStyle = '#FFB897';
                    this.ctx.beginPath();
                    this.ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (cell === 3) {
                    // Power pellet
                    this.ctx.fillStyle = '#FFB897';
                    this.ctx.beginPath();
                    this.ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    showStatusMessage(message) {
        const statusDiv = document.getElementById('gameStatus');
        statusDiv.querySelector('.status-message').innerHTML = message;
        statusDiv.classList.remove('hidden');
    }
    
    hideStatusMessage() {
        document.getElementById('gameStatus').classList.add('hidden');
    }
}

// Player Class with custom sprite
class Player {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.direction = DIRECTION.NONE;
        this.nextDirection = DIRECTION.NONE;
        this.speed = 4;
        this.radius = 0.4;
        this.mouthAngle = 0;
        this.mouthDirection = 1;
        this.powerMode = false;
        this.powerModeTime = 0;
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.direction = DIRECTION.NONE;
        this.nextDirection = DIRECTION.NONE;
        this.powerMode = false;
        this.powerModeTime = 0;
    }
    
    setNextDirection(dir) {
        this.nextDirection = dir;
    }
    
    update(deltaTime, maze) {
        // Try to change direction if possible
        if (this.nextDirection !== DIRECTION.NONE) {
            const nextX = this.x + this.nextDirection.x * deltaTime * this.speed;
            const nextY = this.y + this.nextDirection.y * deltaTime * this.speed;
            
            if (this.canMove(nextX, nextY, maze)) {
                this.direction = this.nextDirection;
            }
        }
        
        // Move in current direction
        if (this.direction !== DIRECTION.NONE) {
            const nextX = this.x + this.direction.x * deltaTime * this.speed;
            const nextY = this.y + this.direction.y * deltaTime * this.speed;
            
            if (this.canMove(nextX, nextY, maze)) {
                this.x = nextX;
                this.y = nextY;
            }
        }
        
        // Wrap around tunnels
        if (this.x < 0) this.x = COLS - 1;
        if (this.x >= COLS) this.x = 0;
        
        // Animate mouth
        this.mouthAngle += this.mouthDirection * deltaTime * 8;
        if (this.mouthAngle > 0.5) {
            this.mouthAngle = 0.5;
            this.mouthDirection = -1;
        } else if (this.mouthAngle < 0) {
            this.mouthAngle = 0;
            this.mouthDirection = 1;
        }
    }
    
    canMove(x, y, maze) {
        const corners = [
            {x: x - this.radius, y: y - this.radius},
            {x: x + this.radius, y: y - this.radius},
            {x: x - this.radius, y: y + this.radius},
            {x: x + this.radius, y: y + this.radius}
        ];
        
        for (let corner of corners) {
            const col = Math.floor(corner.x);
            const row = Math.floor(corner.y);
            
            if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
                // Allow wrapping in tunnels (row 14)
                if (row === 14 || row === 13 || row === 15) continue;
                return false;
            }
            
            if (maze[row][col] === 1) {
                return false;
            }
        }
        
        return true;
    }
    
    draw(ctx) {
        const pixelX = this.x * CELL_SIZE;
        const pixelY = this.y * CELL_SIZE;
        const radius = this.radius * CELL_SIZE;
        
        // Determine rotation based on direction
        let rotation = 0;
        if (this.direction === DIRECTION.RIGHT) rotation = 0;
        else if (this.direction === DIRECTION.DOWN) rotation = Math.PI / 2;
        else if (this.direction === DIRECTION.LEFT) rotation = Math.PI;
        else if (this.direction === DIRECTION.UP) rotation = -Math.PI / 2;
        
        ctx.save();
        ctx.translate(pixelX, pixelY);
        ctx.rotate(rotation);
        
        // Draw KlotsMan (custom Pac-Man sprite)
        ctx.fillStyle = this.powerMode ? '#00FFFF' : '#FFFF00';
        ctx.beginPath();
        ctx.arc(0, 0, radius, this.mouthAngle, Math.PI * 2 - this.mouthAngle);
        ctx.lineTo(0, 0);
        ctx.fill();
        
        // Add eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(radius * 0.3, -radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Ghost Class with custom sprites
class Ghost {
    constructor(x, y, color, name) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.color = color;
        this.name = name;
        this.direction = DIRECTION.NONE;
        this.speed = 3;
        this.radius = 0.4;
        this.scared = false;
        this.lastDirectionChange = 0;
        this.directionChangeInterval = 1;
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.direction = DIRECTION.NONE;
        this.scared = false;
    }
    
    update(deltaTime, maze, player) {
        this.lastDirectionChange += deltaTime;
        
        // Change direction periodically or when stuck
        if (this.lastDirectionChange >= this.directionChangeInterval) {
            this.chooseDirection(maze, player);
            this.lastDirectionChange = 0;
        }
        
        // Move
        const nextX = this.x + this.direction.x * deltaTime * this.speed;
        const nextY = this.y + this.direction.y * deltaTime * this.speed;
        
        if (this.canMove(nextX, nextY, maze)) {
            this.x = nextX;
            this.y = nextY;
        } else {
            // Stuck, choose new direction immediately
            this.chooseDirection(maze, player);
        }
        
        // Wrap around tunnels
        if (this.x < 0) this.x = COLS - 1;
        if (this.x >= COLS) this.x = 0;
    }
    
    chooseDirection(maze, player) {
        const possibleDirections = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];
        const validDirections = [];
        
        for (let dir of possibleDirections) {
            const nextX = this.x + dir.x * 0.5;
            const nextY = this.y + dir.y * 0.5;
            
            if (this.canMove(nextX, nextY, maze)) {
                validDirections.push(dir);
            }
        }
        
        if (validDirections.length > 0) {
            if (this.scared) {
                // Run away from player
                const distances = validDirections.map(dir => {
                    const nextX = this.x + dir.x;
                    const nextY = this.y + dir.y;
                    return {
                        dir,
                        dist: Math.sqrt(Math.pow(nextX - player.x, 2) + Math.pow(nextY - player.y, 2))
                    };
                });
                distances.sort((a, b) => b.dist - a.dist);
                this.direction = distances[0].dir;
            } else {
                // Chase player (find direction that gets closer)
                const distances = validDirections.map(dir => {
                    const nextX = this.x + dir.x;
                    const nextY = this.y + dir.y;
                    return {
                        dir,
                        dist: Math.sqrt(Math.pow(nextX - player.x, 2) + Math.pow(nextY - player.y, 2))
                    };
                });
                distances.sort((a, b) => a.dist - b.dist);
                this.direction = distances[0].dir;
            }
        }
    }
    
    canMove(x, y, maze) {
        const corners = [
            {x: x - this.radius, y: y - this.radius},
            {x: x + this.radius, y: y - this.radius},
            {x: x - this.radius, y: y + this.radius},
            {x: x + this.radius, y: y + this.radius}
        ];
        
        for (let corner of corners) {
            const col = Math.floor(corner.x);
            const row = Math.floor(corner.y);
            
            if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
                if (row === 14 || row === 13 || row === 15) continue;
                return false;
            }
            
            if (maze[row][col] === 1) {
                return false;
            }
        }
        
        return true;
    }
    
    draw(ctx) {
        const pixelX = this.x * CELL_SIZE;
        const pixelY = this.y * CELL_SIZE;
        const radius = this.radius * CELL_SIZE;
        
        ctx.save();
        ctx.translate(pixelX, pixelY);
        
        // Draw ghost body (custom sprite)
        ctx.fillStyle = this.scared ? '#0000FF' : this.color;
        
        // Head (circle top)
        ctx.beginPath();
        ctx.arc(0, -radius * 0.2, radius, Math.PI, 0);
        ctx.fill();
        
        // Body (rectangle)
        ctx.fillRect(-radius, -radius * 0.2, radius * 2, radius * 1.2);
        
        // Wavy bottom
        ctx.beginPath();
        ctx.moveTo(-radius, radius);
        for (let i = 0; i < 4; i++) {
            ctx.lineTo(-radius + (i * 0.5 + 0.25) * radius * 2, radius * 0.7);
            ctx.lineTo(-radius + (i * 0.5 + 0.5) * radius * 2, radius);
        }
        ctx.lineTo(-radius, radius);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.arc(radius * 0.3, -radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        if (!this.scared) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-radius * 0.3, -radius * 0.2, radius * 0.15, 0, Math.PI * 2);
            ctx.arc(radius * 0.3, -radius * 0.2, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});
