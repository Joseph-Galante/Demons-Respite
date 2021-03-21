/***** Canvas Setup *****/
// grab canvas
const canvas = document.querySelector('canvas');

// set canvas attributes
canvas.setAttribute('height', getComputedStyle(canvas).height);
canvas.setAttribute('width', getComputedStyle(canvas).width);

// get 2D context
const context = canvas.getContext('2d');


/***** Constants *****/
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 1;
const ENEMY_WALK_RANGE = 400;


/***** Classes *****/
class Scene
{
    constructor(walls, floors, doors, enemies)
    {
        this.walls = walls;
        this.floors = floors;
        this.doors = doors;
        this.enemies = enemies;
    }

    loadScene ()
    {
        this.floors.forEach(floor => floor.render());
        this.doors.forEach(door => door.render());
        this.walls.forEach(wall => wall.render());
        this.enemies.forEach(enemy => enemy.render());
    }
}

class Rectangle
{
    constructor (x, y, width, height, color)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    render ()
    {
        // rectangle color
        context.fillStyle = this.color;
        // rectangle position and size
        context.fillRect(this.x, this.y, this.width, this.height);
        // context.strokeRect
    }

    left ()
    {
        return this.x;
    }

    right ()
    {
        return this.x + this.width;
    }

    top ()
    {
        return this.y;
    }

    bottom ()
    {
        return this.y + this.height;
    }
}

class Player extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 30, 30, 'blue');
        this.gold = 0;
        this.movingUp = false;
        this.movingDown = false;
        this.movingLeft = false;
        this.movingRight = false;
    }

    type ()
    {
        return 'player';
    }

    direction (dir)
    {
        switch (dir)
        {
            case 'up':
                {
                    this.movingUp = true;
                    this.movingDown = false;
                    this.movingLeft = false;
                    this.movingRight = false;
                    break;
                }
            case 'down':
                {
                    this.movingUp = false;
                    this.movingDown = true;
                    this.movingLeft = false;
                    this.movingRight = false;
                    break;
                }
            case 'left':
                {
                    this.movingUp = false;
                    this.movingDown = false;
                    this.movingLeft = true;
                    this.movingRight = false;
                    break;
                }
            case 'right':
                {
                    this.movingUp = false;
                    this.movingDown = false;
                    this.movingLeft = false;
                    this.movingRight = true;
                    break;
                }
        }
    }

    position ()
    {
        return [this.x, this.y];
    }

    isCollidingWith ()
    {
        // check collisions with walls in scene
        scene.walls.forEach(wall =>
        {
            //check top/bottom
            if (this.top() < wall.bottom() && this.bottom() > wall.top())
            {
                // check left/right
                if (this.left() < wall.right() && this.right() > wall.left())
                {
                    // player moving up
                    if (this.movingUp)
                    {
                        this.y = wall.bottom();
                    }
                    // player moving down
                    else if (this.movingDown)
                    {
                        this.y = wall.top() - this.height;
                    }
                    // player moving left
                    else if (this.movingLeft)
                    {
                        this.x = wall.right();
                    }
                    // player moving right
                    else if (this.movingRight)
                    {
                        this.x = wall.left() - this.width;
                    }
                }
            }
        })

        // check collisions with enemies of scene
        scene.enemies.forEach(enemy =>
        {
            //check top/bottom
            if (this.top() < enemy.bottom() && this.bottom() > enemy.top())
            {
                // check left/right
                if (this.left() < enemy.right() && this.right() > enemy.left())
                {
                    // check if above enemy
                    if (this.bottom() < enemy.bottom())
                    {
                        this.y = enemy.top() - this.height - ENEMY_SPEED;
                    }
                    // check if below enemy
                    else if (this.top() > enemy.top())
                    {
                        this.y = enemy.bottom() + ENEMY_SPEED;
                    }
                    // // check if to left of enemy
                    // else if (this.right() < enemy.right())
                    // {
                    //     this.x = enemy.left() - this.width - ENEMY_SPEED;
                    //     console.log('on left side')
                    // }
                    // // check if to right of enemy
                    // else if (this.left() > enemy.left())
                    // {
                    //     this.y = enemy.right() + ENEMY_SPEED;
                    // }
                }
            }
        })

        scene.doors.forEach(door =>
        {
            //check top/bottom
            if (this.top() < door.bottom() && this.bottom() > door.top())
            {
                // check left/right
                if (this.left() < door.right() && this.right() > door.left())
                {
                    // check if door is locked
                    if (door.isLocked)
                    {
                        // player moving up
                        if (this.movingUp)
                        {
                            this.y = door.bottom();
                        }
                        // player moving down
                        else if (this.movingDown)
                        {
                            this.y = door.top() - this.height;
                        }
                        // player moving left
                        else if (this.movingLeft)
                        {
                            this.x = door.right();
                        }
                        // player moving right
                        else if (this.movingRight)
                        {
                            this.x = door.left() - this.width;
                        }
                    }
                    else
                    {
                        // load to next scene
                    }
                }
            }   
        })
    }
}

class Enemy extends Rectangle
{
    constructor (x, y, dir)
    {
        super(x, y, 40, 40, 'red');
        this.alive = true;
        this.startPos = [this.x, this.y];
        this.movingUp = false;
        this.movingRight = false;
        this.movingLeft = false;
        this.movingDown = false;
        this.moveStates = {
            patrol: 'patrol',
            chase: 'chase',
            attack: 'attack'
        };
        this.moveState = this.moveStates.chase;

        // initialize starting direction
        switch (dir)
        {
            case 'up':
                {
                    this.movingUp = true;
                    break;
                }
            case 'down':
                {
                    this.movingDown = true;
                    break;
                }
            case 'left':
                {
                    this.movingLeft = true;
                    break;
                }
            case 'right':
                {
                    this.movingRight = true;
                    break;
                }
        }
    }

    type ()
    {
        return 'enemy';
    }
                
    position ()
    {
        return [this.x, this.y];
    }

    getDirection ()
    {
        if (this.movingUp)
        {
            return 'up';
        }
        else if (this.movingDown)
        {
            return 'down';
        }
        else if (this.movingLeft)
        {
            return 'left';
        }
        else if (this.movingRight)
        {
            return 'right';
        }
    }

    // set all direction bools to false
    clearDirection ()
    {
        this.movingUp = false;
        this.movingDown = false;
        this.movingLeft = false;
        this.movingRight = false;
    }

    // pick a new direction, wait a bit, then walk towards it
    newDirection ()
    {
        // clear old direction
        this.clearDirection()
        // set new starting position
        this.startPos = this.position();

        // pick a new direction
        switch (Math.floor(Math.random() * 4))
        {
            case 0:
                {
                    this.movingUp = true;
                    break;
                }
            case 1:
                {
                    this.movingDown = true;
                    break;
                }
            case 2:
                {
                    this.movingLeft = true;
                    break;
                }
            case 3:
                {
                    this.movingRight = true;
                    break;
                }
        }
    }

    render ()
    {
        super.render();
        // console.log(this.position())
        // check if enemy is alive
        if (this.alive)
        {
            switch (this.moveState)
            {
                case this.moveStates.patrol:
                    {

                        // move enemy back and forth
                        // move up
                        if (this.movingUp)
                        {
                            // if 
                            if (this.position()[1] > this.startPos[1] - ENEMY_WALK_RANGE)
                            {
                                this.y -= ENEMY_SPEED;
                            }
                            else
                            {
                                this.newDirection();
                            }
                            
                            if (Math.floor(Math.random() * 100) === 0)
                            {   
                                this.newDirection();
                            }
                        }
                        // move down
                        else if (this.movingDown)
                        {
                            if (this.position()[1] < this.startPos[1] + ENEMY_WALK_RANGE)
                            {
                                this.y += ENEMY_SPEED;
                            }
                            else
                            {
                                this.newDirection();
                            }
                            
                            if (Math.floor(Math.random() * 100) === 0)
                            {   
                                this.newDirection();
                            }
                        }
                        // move left
                        else if (this.movingLeft)
                        {
                            if (this.position()[0] > this.startPos[0] - ENEMY_WALK_RANGE)
                            {
                                this.x -= ENEMY_SPEED;
                            }
                            else
                            {
                                this.newDirection();
                            }
                            
                            if (Math.floor(Math.random() * 100) === 0)
                            {   
                                this.newDirection();
                            }
                        }
                        // move right
                        else if (this.movingRight)
                        {
                            if (this.position()[0] > this.startPos[0] + ENEMY_WALK_RANGE)
                            {
                                this.x += ENEMY_SPEED;
                            }
                            else
                            {
                                this.newDirection();
                            }
                            
                            if (Math.floor(Math.random() * 100) === 0)
                            {   
                                this.newDirection();
                            }
                        }
                    }
                case this.moveStates.chase:
                    {
                        this.y -= (this.y - player.y + player.height / 2) / (this.y - player.y + player.height / 2)
                    }
            }
        }
        
        // check collisions with walls in scene
        scene.walls.forEach(wall =>
            {
                //check top/bottom
                if (this.top() < wall.bottom() && this.bottom() > wall.top())
                {
                    // check left/right
                    if (this.left() < wall.right() && this.right() > wall.left())
                    {
                        // enemy moving up
                        if (this.movingUp && this.bottom() > wall.bottom())
                        {
                            this.y = wall.bottom() + 5;
                            this.newDirection();
                        }
                        // enemy moving down
                        else if (this.movingDown && this.top() < wall.top())
                        {
                            this.y = wall.top() - this.height - 5;
                            this.newDirection();
                        }
                        // enemy moving left
                        else if (this.movingLeft && this.right() > wall.right())
                        {
                            this.x = wall.right() + 5;
                            this.newDirection();
                        }
                        // enemy moving right
                        else if (this.movingRight && this.left() < wall.left())
                        {
                            this.x = wall.left() - this.width - 5;
                            this.newDirection();
                        }
                    }
                }
            })
        // check collisions with doors in scene
        scene.doors.forEach(door =>
            {
                //check top/bottom
                if (this.top() < door.bottom() && this.bottom() > door.top())
                {
                    // check left/right
                    if (this.left() < door.right() && this.right() > door.left())
                    {
                        // enemy moving up
                        if (this.movingUp && this.bottom() > door.bottom())
                        {
                            this.y = door.bottom() + 5;
                            this.newDirection();
                        }
                        // enemy moving down
                        else if (this.movingDown && this.top() < door.top())
                        {
                            this.y = door.top() - this.height - 5;
                            this.newDirection();
                        }
                        // enemy moving left
                        else if (this.movingLeft && this.right() > door.right())
                        {
                            this.x = door.right() + 5;
                            this.newDirection();
                        }
                        // enemy moving right
                        else if (this.movingRight && this.left() < door.left())
                        {
                            this.x = door.left() - this.width - 5;
                            this.newDirection();
                        }
                    }
                }
            })
    }
}

class Wall extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 50, 50, 'purple');
    }

    type ()
    {
        return 'door';
    }
}

class Floor extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 50, 50, 'green');
    }
}

class Door extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 50, 50, 'black');
        this.isLocked = false;
    }

    locked ()
    {
        // lock door
        this.isLocked = true;
        // change to brown door - isL
        this.color = 'brown';
        // rectangle color
        context.fillStyle = this.color;
        // rectangle position and size
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    unlocked ()
    {
        // unlock door
        this.isLocked = false;
        // change to brown door - locked
        this.color = 'black';
        // rectangle color
        context.fillStyle = this.color;
        // rectangle position and size
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    render ()
    {
        super.render();
        // check for empty room
        if (scene.enemies.length > 0)
        {
            // enemies or gold remaining - lock doors
            this.locked();
        }
        else
        {
            // empty room - unlock doors
            this.unlocked();
        }
    }
}


/***** Event Listeners *****/

// player movement - handles canvas collisions as well
document.addEventListener('keydown', (event) =>
{
    if (event.key === 'w')
    {
        // change direction
        player.direction('up');

        if (player.top() <= 0)
        {
            player.y = 0;
        }
        else
        {
            player.y -= PLAYER_SPEED;
        }  
    }
    else if (event.key === 'd')
    {
        // change direction
        player.direction('right');
        
        if (player.right() >= canvas.width)
        {
            player.x = canvas.width - player.width;
        }
        else
        {
            player.x += PLAYER_SPEED;
        }  
    }
    else if (event.key === 'a')
    {
        // change direction
        player.direction('left');

        if (player.left() <= 0)
        {
            player.x = 0;
        }
        else
        {
            player.x -= PLAYER_SPEED;
        }  
    }
    else if (event.key === 's')
    {
        // change direction
        player.direction('down');

        if (player.bottom() >= canvas.height)
        {
            player.y = canvas.height - player.height;
        }
        else
        {
            player.y += PLAYER_SPEED;
        }  
    }
});


/***** Setup *****/

// create player
const player = new Player(50, 230, 30, 30, 'blue');

// create enemies
const enemies =
[
    // new Enemy(300, 300, 'up'),
    // new Enemy(100, 350),
    // new Enemy(360, 70)
]
// create walls
const walls = makeWalls([0], [0], [4,5], [4,5], [[2, 2], [7, 2], [2, 7], [7, 7]]);
// create floors
const floors = makeFloors([[4,5], [5,5]]);
// create doors
const doors = makeDoors();

// track all objects in scene
const scene = new Scene(walls, floors, doors, enemies);


/*===================== Game Loop ======================*/
const animate = () =>
{
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // render scene
    scene.loadScene();
    // render player
    player.render();
    // render all enemies
    enemies.forEach(enemy => enemy.render());
    // check for collisions
    player.isCollidingWith();
    // call animate again when possible
    requestAnimationFrame(animate);
}
/*======================================================*/

// Start
animate();


/***** Functions *****/

// Create walls
function makeWalls (top, bottom, left, right, extra)
{
    // walls array
    const walls = [];

    // border needs 32 walls
    // top side
    for (let i = 0; i <= 10; i++)
    {
        if (top.includes(i) && i !== 0)
        {
            continue;
        }
        walls.push(new Wall(i * 50, 0));
    }
    // bottom
    for (let i = 0; i <= 10; i++)
    {
        if (bottom.includes(i) && i !== 0)
        {
            continue;
        }
        walls.push(new Wall(i * 50, canvas.height - 50));
    }
    // left
    for (let i = 1; i <= 8; i++)
    {
        if (left.includes(i) && i !== 0)
        {
            continue;
        }
        walls.push(new Wall(0, i * 50));
    }
    // right
    for (let i = 1; i <= 8; i++)
    {
        if (right.includes(i) && i !== 0)
        {
            continue;
        }
        walls.push(new Wall(canvas.width - 50, i * 50));
    }

    // pillars
    extra.forEach(wall =>
    {
        walls.push(new Wall(wall[0] * 50, wall[1] * 50));
    })

    return walls;
}

// Create floors
function makeFloors (holes)
{
    // floors array
    const floors = [];

    // floors are 8x8
    // loop through rows
    for (let i = 1; i <= 8; i++)
    {
        // loop through columns
        for (let j = 1; j <= 8; j++)
        {
            if (i === holes[0] && j === holes[1])
            {
                continue;
            }
            floors.push(new Floor(i * 50, j * 50))
        }
    }

    return floors;
}

// Create doors
function makeDoors ()
{
    // doors array
    const doors = [];

    // doors are 2x1, centered on right and left sides
    // left side
    for (let i = 4; i <= 5; i++)
    {
        doors.push(new Door(0, i * 50));
    }
    // right side
    for (let i = 4; i <= 5; i++)
    {
        doors.push(new Door(canvas.width - 50, i * 50));
    }

    return doors;
}