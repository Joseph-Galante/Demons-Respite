// grab canvas
const canvas = document.querySelector('canvas');

// set canvas attributes
canvas.setAttribute('height', getComputedStyle(canvas).height);
canvas.setAttribute('width', getComputedStyle(canvas).width);

// get 2D context
const context = canvas.getContext('2d');

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
            if (player.right() > enemy.left() && player.left() < enemy.right())
            {
                if (player.bottom() > enemy.top() && player.top() < enemy.bottom())
                {
                    console.log('hit enemy');
                }
            }
        })
    }
}

class Enemy extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 40, 40, 'green');
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
        super(x, y, 50, 50, 'yellow');
    }
}

class Door extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 50, 50, 'black');
    }
}

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
            player.y -= 5;
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
            player.x -= 5;
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
            player.y += 5;
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
            player.x += 5;
        }  
    }
});

// create player
const player = new Rectangle(100, 100, 30, 30, 'blue');
// create enemies
const enemies =
[
    new Enemy(200, 200),
    // new Enemy(50, 250),
    // new Enemy(300, 350),
    // new Enemy(400, 50)
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