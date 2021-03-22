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
        this.changingScenes = false;
    }

    nextScene ()
    {
        // check if currently changing scenes - prevents multiple scene changes from entering a door 'once'
        if (!this.changingScenes)
        {
            currentScene = this.scenes[this.scenes.indexOf(currentScene) + 1];
            this.changingScenes = true;
        }
    }

    lastScene ()
    {
        // check if currently changing scenes - prevents multiple scene changes from entering a door 'once'
        if (!this.changingScenes)
        {
            currentScene = this.scenes[this.scenes.indexOf(currentScene) - 1];
            this.changingScenes = true;
        }
    }

    loadScene (scene)
    {
        this.currentScene = scene;
        // scene changed successfully
        this.changingScenes = false;

        // render scene
        scene.floors.forEach(floor => floor.render());
        scene.floors.forEach(floor => context.strokeRect(floor.x, floor.y, floor.width, floor.height));
        scene.doors.forEach(door => door.render());
        scene.walls.forEach(wall => wall.render());
        scene.enemies.forEach(enemy => enemy.render());

        // render weapon if player is attacking
        if (player.attacking)
        {
            player.weapon.render();
            setTimeout(function()
            {
                player.attacking = false;
            }, 300)
        }

        // render shield if player is blocking
        if (player.blocking)
        {
            player.shield.render();
            setTimeout(function()
            {
                player.blocking = false;
            }, 500)
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
        this.prevDoors = [];
        this.nextDoors = [];
    }

    makeScene (pillars, enemies, start)
    {
        this.makeWalls(pillars, start);
        this.makeFloors();
        this.makeDoors(start);
        this.makeEnemies(enemies);
    }

    // Create walls
    makeWalls (pillars, start)
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
            // only skip if not in starting room
            if (!start)
            {
                if (i === 4 || i === 5)
                {
                    continue;
                }
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
    makeDoors (start)
    {
        // doors array
        const doors = [];

        // doors are 2x1, centered on right and left sides

        // check if in starting room - dont draw doors on left side
        if (!start)
        {
            // left side
            for (let i = 4; i <= 5; i++)
            {
                const newDoor = new Door(0, i * 50);
                this.prevDoors.push(newDoor);
                doors.push(newDoor);
            }
        }
        // right side
        for (let i = 4; i <= 5; i++)
        {
            const newDoor = new Door(canvas.width - 50, i * 50);
            this.nextDoors.push(newDoor);
            doors.push(newDoor);
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
        this.shield;
        this.attacking = false;
        this.blocking = false;
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

    block ()
    {
        this.blocking = true;
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
        sceneManager.currentScene.walls.forEach(wall =>
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
        sceneManager.currentScene.enemies.forEach(enemy =>
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
                        sceneManager.currentScene.enemies.splice(sceneManager.currentScene.enemies.indexOf(enemy), 1);
                    }
                    else
                    {
                        this.takeDamage(5);
                        this.knockback(enemy);
                        console.log(player.health);
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

        // check for player entering doors
        sceneManager.currentScene.doors.forEach(door =>
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
                    // door is unlocked
                    else
                    {
                        // check if entering left or right doors
                        // left doors
                        if (sceneManager.currentScene.prevDoors.includes(door))
                        {
                            // load previous scene
                            sceneManager.lastScene();
                            // place player at front of right doors
                            player.x = 415;
                            player.y = 235;
                        }
                        // right doors
                        else if (sceneManager.currentScene.nextDoors.includes(door))
                        {
                            // load next scene
                            sceneManager.nextScene();
                            // place player at front of left doors
                            player.x = 55;
                            player.y = 235;
                        }
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
        sceneManager.currentScene.enemies.forEach(enemy =>
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

class Shield extends Rectangle
{
    constructor(blockPower)
    {
        super(player.x + player.width, player.y + player.height / 4, 30, 15, 'brown');
        this.blockPower = blockPower;
    }

    render ()
    {
        super.render();

        if (player.movingUp)
        {
            this.x = player.x;
            this.y = player.top() - 15;
            this.height = 15;
            this.width = 30;
        }
        else if (player.movingDown)
        {
            this.x = player.x;
            this.y = player.bottom();
            this.height = 15;
            this.width = 30;
        }
        else if (player.movingLeft)
        {
            this.x = player.left() - 15;
            this.y = player.y;
            this.height = 30;
            this.width = 15;
        }
        else if (player.movingRight)
        {
            this.x = player.right();
            this.y = player.y;
            this.height = 30;
            this.width = 15;
        }

        // check for collisions with enemies
        sceneManager.currentScene.enemies.forEach(enemy =>
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
                        enemy.knockback(20);
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

            this.knockback(50);
            
            if (this.health <= 0)
            {
                this.die();
            }
        }
    }

    knockback (force)
    {
        // player moving up
        if (player.movingUp)
        {
            this.y -= force;

            if (this.y < 50)
            {
                this.y = 50;
            }
        }
        // player moving down
        else if (player.movingDown)
        {
            this.y += force;

            if (this.y > canvas.height - 50)
            {
                this.y = canvas.height - 50;;
            }
        }
        // player moving left
        else if (player.movingLeft)
        {
            this.x -= force;

            if (this.x < 50)
            {
                this.x = 50;
            }
        }
        // player moving right
        else if (player.movingRight)
        {
            this.x += force;

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
        sceneManager.currentScene.walls.forEach(wall =>
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
        sceneManager.currentScene.doors.forEach(door =>
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
        if (sceneManager.currentScene.enemies.length > 0)
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

// player attack
document.addEventListener('click', () =>
{
    if (!player.attacking)
    {
        player.attack();
    }
})

// player block
document,addEventListener('auxclick', (event) =>
{
    event.preventDefault();

    if (!player.attacking && !player.blocking)
    {
        player.block();
    }
})

/***** Scenes  *****/

// array of scenes
let scenes = [];

// create scene
const scene0 = new Scene('scene0');
// populate scene
scene0.makeScene([], [], true)
// add scene to scene list
scenes.push(scene0);

// create scene
const scene1 = new Scene('scene1');
// populate scene
scene1.makeScene([[2,2], [7,2], [2,7], [7,7]], [
    // new Enemy(300, 300, 'up'),
    // new Enemy(100, 350),
    // new Enemy(360, 70)
], false)
// add scene to scene list
scenes.push(scene1);

const scene2 = new Scene('scene2');
scene2.makeScene([[3,3], [4,3], [5,3], [6,3], [3,6], [4,6], [5,6], [6,6]], [
    new Enemy(300, 250, 'down')
], false)
scenes.push(scene2);

/***** Setup *****/

// create player
const player = new Player(235, 235, 30, 30, 'blue');
player.weapon = new Weapon(5);
player.shield = new Shield(50);

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