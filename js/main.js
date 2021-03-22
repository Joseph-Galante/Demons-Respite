/***** Canvas Setup *****/
// grab canvas
const canvas = document.querySelector('canvas');

// set canvas attributes
canvas.setAttribute('height', getComputedStyle(canvas).height);
canvas.setAttribute('width', getComputedStyle(canvas).width);

// get 2D context
const context = canvas.getContext('2d');


/***** Constants *****/
const PLAYER_SPEED = 10;
const ENEMY_SPEED = 0.6;
const ENEMY_WALK_RANGE = 400;
const ENEMY_SIGHT_RANGE = 150;
const ENEMY_ATTACK_RANGE = 5;


/***** Classes *****/
class SceneManager
{
    constructor(scenes)
    {
        this.scenes = scenes;
        this.currentScene;
    }

    scene ()
    {
        return this.currentScene;
    }
    
    changeScene ()
    {
        // pick a random scene
        currentScene = eval('scene' + Math.floor(Math.random() * this.scenes.length));
    }

    loadScene (scene)
    {
        this.currentScene = scene;
        scene.floors.forEach(floor => floor.render());
        scene.floors.forEach(floor => context.strokeRect(floor.x, floor.y, floor.width, floor.height));
        scene.doors.forEach(door => door.render());
        scene.walls.forEach(wall => wall.render());
        scene.enemies.forEach(enemy => enemy.render());

        if (player.attacking)
        {
            player.weapon.render();
            setTimeout(function()
            {
                player.attacking = false;
            }, 300)
        }
    }
}
class Scene
{
    constructor(name)
    {
        this.name = name;
        this.walls = [];
        this.floors = [];
        this.doors = [];
        this.enemies = [];
    }

    makeScene (pillars, enemies)
    {
        this.makeWalls(pillars);
        this.makeFloors();
        this.makeDoors();
        this.makeEnemies(enemies);
    }

    // Create walls
    makeWalls (pillars)
    {
        // walls array
        const walls = [];

        // border needs 32 walls
        // top side
        for (let i = 0; i <= 10; i++)
        {
            walls.push(new Wall(i * 50, 0));
        }
        // bottom
        for (let i = 0; i <= 10; i++)
        {
            walls.push(new Wall(i * 50, canvas.height - 50));
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
        // right
        for (let i = 1; i <= 8; i++)
        {
            if (i == 4 || i === 5)
            {
                continue;
            }
            walls.push(new Wall(canvas.width - 50, i * 50));
        }

        // pillars
        pillars.forEach(wall =>
        {
            if (wall)
            {
                walls.push(new Wall(wall[0] * 50, wall[1] * 50));
            }
        })

        this.walls = walls;
    }

    // Create floors
    makeFloors ()
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

        this.floors = floors;
    }

    // Create doors
    makeDoors ()
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

        this.doors = doors;
    }

    // Create enemies
    makeEnemies (enemies)
    {
        this.enemies = enemies;
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
        this.health = 100;
        this.movingUp = false;
        this.movingDown = false;
        this.movingLeft = false;
        this.movingRight = false;
        this.weapon;
        this.attacking = false;
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

    takeDamage (damage)
    {
        this.health -= damage;

        if (this.health <= 0)
        {
            this.die();
        }
    }

    die ()
    {
        // game over
    }

    attack ()
    {
        this.attacking = true;
        this.weapon.active = true;
    }

    knockback (enemy)
    {
        // player moving up
        if (enemy.movingUp)
        {
            this.y -= 50;

            if (this.y < 50)
            {
                this.y = 50;
            }
        }
        // player moving down
        else if (enemy.movingDown)
        {
            this.y += 50;

            if (this.y > canvas.height - 50)
            {
                this.y = canvas.height - 50;;
            }
        }
        // player moving left
        else if (enemy.movingLeft)
        {
            this.x -= 50;

            if (this.x < 50)
            {
                this.x = 50;
            }
        }
        // player moving right
        else if (enemy.movingRight)
        {
            this.x += 50;

            if (this.x > canvas.width - 50)
            {
                this.x = canvas.width - 50;;
            }
        }
    }

    isCollidingWith ()
    {
        // check collisions with walls in scene
        sceneManager.scene().walls.forEach(wall =>
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
        sceneManager.scene().enemies.forEach(enemy =>
        {
            //check top/bottom
            if (this.top() < enemy.bottom() && this.bottom() > enemy.top())
            {
                // check left/right
                if (this.left() < enemy.right() && this.right() > enemy.left())
                {
                    if (!enemy.alive)
                    {
                        // add gold
                        this.gold += 2;
                        // remove enemy
                        sceneManager.scene().enemies.splice(sceneManager.scene().enemies.indexOf(enemy), 1);
                    }
                    else
                    {
                        this.takeDamage(5);
                        this.knockback(enemy);
                    }
                    // // check if above enemy
                    // if (this.bottom() < enemy.bottom())
                    // {
                    //     this.y = enemy.top() - this.height - ENEMY_SPEED;
                    // }
                    // // check if below enemy
                    // else if (this.top() > enemy.top())
                    // {
                    //     this.y = enemy.bottom() + ENEMY_SPEED;
                    // }
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

        sceneManager.scene().doors.forEach(door =>
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
                        // load next scene
                        sceneManager.changeScene();
                        // place player at front of door
                        player.x = 50;
                        player.y = 230;
                    }
                }
            }   
        })
    }
}

class Weapon extends Rectangle
{
    constructor (damage)
    {
        super(player.x + player.width, player.y + player.height / 4, 30, 15, 'gray');
        this.damage = damage;
        this.active = false;
    }

    render ()
    {
        super.render();

        if (player.movingUp)
        {
            this.x = player.x + player.width / 4;
            this.y = player.top() - 30;
            this.height = 30;
            this.width = 15;
        }
        else if (player.movingDown)
        {
            this.x = player.x + player.width / 4;
            this.y = player.bottom();
            this.height = 30;
            this.width = 15;
        }
        else if (player.movingLeft)
        {
            this.x = player.left() - 30;
            this.y = player.y + player.height / 4;
            this.height = 15;
            this.width = 30;
        }
        else if (player.movingRight)
        {
            this.x = player.right();
            this.y = player.y + player.height / 4;
            this.height = 15;
            this.width = 30;
        }

        // check for collisions with enemies
        sceneManager.scene().enemies.forEach(enemy =>
        {
            // check if hitbox is active
            if (this.active)
            {
                //check top/bottom
                if (this.top() < enemy.bottom() && this.bottom() > enemy.top())
                {
                    // check left/right
                    if (this.left() < enemy.right() && this.right() > enemy.left())
                    {
                        enemy.takeDamage(this.damage);
                        this.active = false;
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
        this.prevX = this.x;
        this.prevY = this.y;
        this.movingUp = false;
        this.movingRight = false;
        this.movingLeft = false;
        this.movingDown = false;
        this.moveStates = {
            patrol: 'patrol',
            chase: 'chase',
            attack: 'attack'
        };
        this.moveState = this.moveStates.patrol;
        this.destination;
        this.destinationReached = false;
        this.destinationSet = false;
        this.health = 10;
        this.weapon;
        this.attacking = false;
        this.damaged = false;

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

    takeDamage (damage)
    {
        if (this.alive)
        {
            this.health -= damage;

            this.knockback();
            
            if (this.health <= 0)
            {
                this.die();
            }
        }
    }

    knockback ()
    {
        // player moving up
        if (player.movingUp)
        {
            this.y -= 50;

            if (this.y < 50)
            {
                this.y = 50;
            }
        }
        // player moving down
        else if (player.movingDown)
        {
            this.y += 50;

            if (this.y > canvas.height - 50)
            {
                this.y = canvas.height - 50;;
            }
        }
        // player moving left
        else if (player.movingLeft)
        {
            this.x -= 50;

            if (this.x < 50)
            {
                this.x = 50;
            }
        }
        // player moving right
        else if (player.movingRight)
        {
            this.x += 50;

            if (this.x > canvas.width - 50)
            {
                this.x = canvas.width - 50;;
            }
        }
    }

    die ()
    {
        this.alive = false;
        this.color = 'yellow';
        this.x = this.x + this.width / 4;
        this.y = this.y + this.height / 4;
        this.width /= 2;
        this.height /= 2;
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

    // find distance to player's center
    distanceToPlayer ()
    {
        return Math.sqrt(Math.pow((player.x + player.width / 2) - (this.x + this.width / 2), 2) + Math.pow((player.y + player.height / 2) - (this.y + this.height / 2), 2));
    }

    distanceToPoint (point)
    {
        return Math.sqrt(Math.pow(point[0] - this.x, 2) + Math.pow(point[1] - this.y, 2));
    }

    render ()
    {
        super.render();
        // check if enemy is alive
        if (this.alive)
        {
            // check if being damaged
            if (this.damaged)
            {
                this.color = 'orange';
            }
            else
            {
                this.color = 'red';
            }

            //check if player is outside of sight range
            if (this.distanceToPlayer() > ENEMY_SIGHT_RANGE)
            {
                // patrol
                this.moveState = this.moveStates.patrol;
            }
            // check for player within sight range
            else if (this.distanceToPlayer() < ENEMY_SIGHT_RANGE && this.distanceToPlayer() > ENEMY_ATTACK_RANGE)
            {
                // chase
                this.moveState = this.moveStates.chase;
            }
            // check for player within attack range
            else if (this.distanceToPlayer() < ENEMY_ATTACK_RANGE)
            {
                // attack
                this.moveState = this.moveStates.attack;
            }

            // movement based on current move state
            switch (this.moveState)
            {
                // patrolling
                case this.moveStates.patrol:
                    {
                        // get prev position
                        this.prevX = this.x;
                        this.prevY = this.y;

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
                            
                            if (Math.floor(Math.random() * 300) === 0)
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
                            
                            if (Math.floor(Math.random() * 300) === 0)
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
                        
                        if (Math.floor(Math.random() * 300) === 0)
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
                        
                        if (Math.floor(Math.random() * 300) === 0)
                        {   
                            this.newDirection();
                        }
                    }
                    
                    break;
                }
            // chasing
            case this.moveStates.chase:
                {
                    // save previous position
                    this.prevX = this.x;
                    this.prevY = this.y;
                    // move towards player
                    this.x -= (this.x - player.x) / this.distanceToPlayer();
                    this.y -= (this.y - player.y) / this.distanceToPlayer();
                    
                    break;
                }
            // attacking
            case this.moveStates.attack:
                {
                    this.x = this.x;
                    this.y = this.y;
                    break;
                }
            }
        }
                
        // check collisions with walls in scene
        sceneManager.scene().walls.forEach(wall =>
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

                        this.x = this.prevX;
                        this.y = this.prevY;
                    }

                }
            })
        // check collisions with doors in scene
        sceneManager.scene().doors.forEach(door =>
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
        if (sceneManager.scene().enemies.length > 0)
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

document.addEventListener('click', () =>
{
    if (!player.attacking)
    {
        player.attack();
    }
})


/***** Scenes  *****/

// array of scenes
let scenes = [];

// create scene
const scene0 = new Scene('scene0');
// populate scene
scene0.makeScene([[2,2], [7,2], [2,7], [7,7]], [
    new Enemy(300, 300, 'up'),
    // new Enemy(100, 350),
    // new Enemy(360, 70)
])
// add scene to scene list
scenes.push(scene0);

const scene1 = new Scene('scene1');
scene1.makeScene([[3,3], [4,3], [5,3], [6,3], [3,6], [4,6], [5,6], [6,6]], [
    new Enemy(300, 250, 'down')
])
scenes.push(scene1);

/***** Setup *****/

// create player
const player = new Player(50, 230, 30, 30, 'blue');
player.weapon = new Weapon(5);

// scene manager
const sceneManager = new SceneManager(scenes);

// first scene
let currentScene = scene0;

/*===================== Game Loop ======================*/
const animate = () =>
{
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // render scene
    sceneManager.loadScene(currentScene);
    // render player
    player.render();
    // check for collisions
    player.isCollidingWith();
    // call animate again when possible
    requestAnimationFrame(animate);
}
/*======================================================*/

// Start
animate();


/***** Functions *****/