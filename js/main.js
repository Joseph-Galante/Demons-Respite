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
const ENEMY_SPEED = 3;


/***** Classes *****/

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

    checkCollisions ()
    {
        // check collisions with enemies
        enemies.forEach (enemy =>
        {
            // check if enemy is alive
            if (enemy.alive)
            {
                // check player's left/right
                if (player.right() > enemy.left() && player.left() < enemy.right())
                {
                    // check player's top/bottom
                    if (player.bottom() > enemy.top() && player.top() < enemy.bottom())
                    {
                        // turn enemy to dust and bones
                        enemy.alive = false;
                        enemy.color = 'yellow';
                        enemy.width = 25;
                        enemy.height = 25;
                        enemy.x += 6.25;
                        enemy.y += 6.25;
                    }
                }
            }
            // enemy is dead
            else
            {
                // check player's left/right
                if (player.right() > enemy.left() && player.left() < enemy.right())
                {
                    // check player's top/bottom
                    if (player.bottom() > enemy.top() && player.top() < enemy.bottom())
                    {
                        // gain gold
                        player.gold += 2;
                        // remove enemy
                        enemies.splice(enemies.indexOf(enemy), 1);
                    }
                }
            }
        })
    }
}

class Player extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 30, 30, 'blue');
        this.gold = 0;
    }
}

class Enemy extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 40, 40, 'green');
        this.alive = true;
    }

    position ()
    {
        return [this.x, this.y];
    }

    render ()
    {
        super.render();

        // move enemy back and forth
        // get start position
        let startPos = [this.x, this.y];
        // move up until 100px above start pos
        while (this.position()[1] > startPos[1] + 100)
        {
            this.y -= ENEMY_SPEED;
        }
    }
}

class Wall extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 50, 50, 'purple');
    }
}

class Floor extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 50, 50, 'gray');
    }
}

class Door extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 50, 50, 'black');
    }
}


/***** Event Listeners *****/

// player movement - handles canvas collisions as well
document.addEventListener('keydown', (event) =>
{
    if (event.key === 'w')
    {
        if (player.top() <= 50)
        {
            player.y = 50;
        }
        else
        {
            player.y -= PLAYER_SPEED;
        }  
    }
    else if (event.key === 'a')
    {
        if (player.left() <= 50)
        {
            player.x = 50;
        }
        else
        {
            player.x -= PLAYER_SPEED;
        }  
    }
    else if (event.key === 's')
    {
        if (player.bottom() >= canvas.height - 50)
        {
            player.y = canvas.height - 50 - player.height;
        }
        else
        {
            player.y += PLAYER_SPEED;
        }  
    }
    else if (event.key === 'd')
    {
        if (player.right() >= canvas.width - 50)
        {
            player.x = canvas.width - 50 - player.width;
        }
        else
        {
            player.x += PLAYER_SPEED;
        }  
    }
});


/***** Setup *****/

// create player
const player = new Player(50, 230, 30, 30, 'blue');

// create enemies
const enemies =
[
    new Enemy(300, 300),
    new Enemy(100, 350),
    new Enemy(360, 70)
]
// create walls
const walls = makeWalls();
// create floors
const floors = makeFloors();
// create doors
const doors = makeDoors();


/*===================== Game Loop ======================*/
const animate = () =>
{
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // render walls
    walls.forEach(wall => wall.render())
    // render floors
    floors.forEach(floor => floor.render())
    // render doors
    doors.forEach(door => door.render());
    // render player
    player.render();
    // render all enemies
    enemies.forEach(enemy => enemy.render());
    // check for collisions
    player.checkCollisions();
    // call animate again when possible
    requestAnimationFrame(animate);
}
/*======================================================*/

// Start
animate();


/***** Functions *****/

// Create walls
function makeWalls ()
{
    // walls array
    const walls = [];

    // border needs 32 walls
    // top side
    for (let i = 0; i <= 10; i++)
    {
        walls.push(new Wall(i * 50, 0));
    }
    // left
    for (let i = 1; i <= 8; i++)
    {
        if (i === 4 || i === 5)
        {
            continue;
        }
        walls.push(new Wall(0, i * 50));
    }
    // bottom
    for (let i = 0; i <= 10; i++)
    {
        walls.push(new Wall(i * 50, canvas.height - 50));
    }
    // right
    for (let i = 1; i <= 8; i++)
    {
        if (i === 4 || i === 5)
        {
            continue;
        }
        walls.push(new Wall(canvas.width - 50, i * 50));
    }

    return walls;
}

// Create floors
function makeFloors ()
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