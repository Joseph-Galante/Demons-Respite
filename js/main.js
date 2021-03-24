/***** Canvas Setup *****/
// grab canvas
const canvas = document.querySelector('canvas');

// set canvas attributes
canvas.setAttribute('height', getComputedStyle(canvas).height);
canvas.setAttribute('width', getComputedStyle(canvas).width);

// get 2D context
const context = canvas.getContext('2d');


/***** Variables *****/
let gamePaused = false;
let gameRunning = false;
let time = 0;


/***** Constants *****/
const PLAYER_SPEED = 10;
const ENEMY_SPEED = 1;
const ENEMY_WALK_RANGE = 400;
const ENEMY_SIGHT_RANGE = 150;
const ENEMY_ATTACK_RANGE = 5;
const ENEMY_RADIUS = 40;


/***** DOM Images *****/
const enemyModel = document.querySelector('#enemyModel');


/***** DOM Elements *****/
const playerHealth = document.querySelector('.health');
const playerGold = document.querySelector('.gold');
const bossHealth = document.querySelector('.bossHealth');
const gameplay = document.querySelector('.gameplay');
const winScreen = document.querySelector('.winScreen');
const loseScreen = document.querySelector('.loseScreen');
const mainMenu = document.querySelector('.mainMenu');
const playGame = document.querySelector('.play-game');
const controlsButton = document.querySelector('.controlsBtn');
const controls = document.querySelector('.controls');
const returnButton = document.querySelector('.return');
const winReturnButton = document.querySelector('.winReturn');
const loseReturnButton = document.querySelector('.loseReturn');
const gameMenu = document.querySelector('.gameMenu');
const gameMenuControlsButton = document.querySelector('.gameMenuControlsButton');
const gameMenuControlsReturn = document.querySelector('.gameMenuControlsReturn');
const gameMenuReturn = document.querySelector('.gameMenuReturn');
const gameMenuControls = document.querySelector('.gameMenuControls');
const abilityCooldown = document.querySelector('.abilityCooldown');
const timeUI = document.querySelector('.timeUI');


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

        // win scene
        if (scene.name === 'win')
        {
            this.winScene();
        }

        // lose scene
        if (scene.name === 'lose')
        {
            this.loseScene();
        }

        // main menu
        if (scene.name === 'mainMenu')
        {
            this.mainMenu();
        }

        // controls screen
        if (scene.name === 'controls')
        {
            this.controls();
        }

        // playing
        if (scene.name === 'start')
        {
            this.playGame();
        }

        if (!gamePaused)
        {
            // render scene
            scene.floors.forEach(floor => floor.render());
            scene.floors.forEach(floor => context.strokeRect(floor.x, floor.y, floor.width, floor.height));
            scene.doors.forEach(door => door.render());
            scene.walls.forEach(wall => wall.render());
            scene.pickups.forEach(pickup => pickup.render());
            scene.enemies.forEach(enemy => enemy.render());
            scene.boss.forEach(boss => boss.render());
            
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
                }, 600)
            }

            // render ability if player is using one
            if (player.useAbility)
            {
                player.skill.render();
                setTimeout(function()
                {
                    player.useAbility = false;
                }, 200)
            }
            
            // UI
            playerHealth.textContent = `Health: ${player.health}`;
            playerGold.textContent = `Gold: ${player.gold}`;
            // if in boss fight
            if (this.currentScene.boss.length > 0)
            {
                bossHealth.textContent = `Demon HP: ${boss.health}`;
                bkgrndMusic.pause();
                bossAudio.play();
            }
            else
            {
                bossHealth.textContent = '';
                bossAudio.pause();
            }
        }
    }

    // win screen
    winScene ()
    {
        // reset boss audio
        bossAudio.pause();
        bossAudio.currentTime = 0;

        gamePaused = true;
        gameRunning = false;
        gameplay.classList.add('hidden');
        gameMenu.classList.add('hidden');
        mainMenu.classList.add('hidden');
        winScreen.classList.remove('hidden');
    }
    // lose screen
    loseScene ()
    {
        gamePaused = true;
        gameRunning = false;
        gameplay.classList.add('hidden');
        gameMenu.classList.add('hidden');
        mainMenu.classList.add('hidden');
        loseScreen.classList.remove('hidden');
    }
    // main menu
    mainMenu ()
    {
        gamePaused = true;
        gameRunning = false;
        gameplay.classList.add('hidden');
        loseScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        controls.classList.add('hidden');
        gameMenu.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    }
    // game play
    playGame ()
    {
        gamePaused = false;
        gameRunning = true;
        loseScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        mainMenu.classList.add('hidden');
        controls.classList.add('hidden');
        gameplay.classList.remove('hidden');
    }
    // controls screen
    controls ()
    {
        gamePaused = true;
        mainMenu.classList.add('hidden');
        gameMenu.classList.add('hidden');
        controls.classList.remove('hidden');
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
        this.boss = [];
        this.prevDoors = [];
        this.nextDoors = [];
        this.pickups = [];
    }

    makeScene (pillars, enemies, start, boss)
    {
        this.makeWalls(pillars, start);
        this.makeFloors();
        this.makeDoors(start);
        this.makeEnemies(enemies, boss);
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
        for (let i = 0; i <= 9; i++)
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
    makeEnemies (enemies, boss)
    {
        if (boss)
        {
            this.boss = enemies;
        }
        else
        {
            this.enemies = enemies;
        }
    }
}

class Sound
{
    constructor (source)
    {
        this.audioElement = document.createElement('audio');
        this.audioElement.source = source;
        this.audioElement.setAttribute("preload", "auto");
        this.audioElement.setAttribute("controls", "none");
        this.audioElement.style.display = "none";
        document.body.appendChild(this.audioElement);
    }

    play ()
    {
        this.audioElement.play();
        console.log('audio playing');
    }

    stop ()
    {
        this.audioElement.pause();
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

class Pickup extends Rectangle
{
    constructor (x, y, color, type, value)
    {
        super(x, y, 20, 20, color)
        this.type = type;
        this.value = value;
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
        this.movingRight = true;
        this.weapon;
        this.shield;
        this.skill;
        this.attacking = false;
        this.blocking = false;
        this.useAbility = false;
        this.canAttack = true;
        this.canBlock = true;
        this.canUseAbility = true;
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
        // rewind hurt audio and play
        hurtAudio.currentTime = 0;
        hurtAudio.play();

        this.health -= damage;

        if (this.health <= 0)
        {
            this.die();
        }
    }

    die ()
    {
        currentScene.enemies = [];
        bkgrndMusic.pause();
        bossAudio.pause();
        currentScene = loseScene;
    }

    attack ()
    {
        // rewind attack audio and play
        attackAudio.currentTime = 0;
        attackAudio.play();

        this.canAttack = false;
        this.attacking = true;
        this.weapon.active = true;
        setTimeout(function()
        {
            player.canAttack = true;
        }, 800)
    }

    block ()
    {
        this.canBlock = false;
        this.blocking = true;
        this.shield.active = true;
        setTimeout(function()
        {
            player.canBlock = true;
        }, 1500)
    }

    ability ()
    {
        // rewind slam audio and play
        slamAudio.currentTime = 0;
        slamAudio.play();

        this.canUseAbility = false;
        this.useAbility = true;
        this.skill.active = true;
        abilityCooldown.classList.add('cooldown');

        setTimeout(function()
        {
            player.canUseAbility = true;
            player.skill.active = false;
            abilityCooldown.classList.remove('cooldown');
        }, 5000)
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
                this.y = canvas.height - 50;
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
        // render forward
        // player moving up
        if (this.movingUp)
        {
            // eyes
            context.fillStyle = 'white'
            context.fillRect(this.x + this.width / 3 - 2, this.y, 3, 3);
            context.fillStyle = 'white'
            context.fillRect(this.x + this.width / 3 + 8, this.y, 3, 3);
        }
        // player moving down
        else if (this.movingDown)
        {
            // eyes
            context.fillStyle = 'white'
            context.fillRect(this.x + this.width / 3 - 2, this.y + this.height - 3, 3, 3);
            context.fillStyle = 'white'
            context.fillRect(this.x + this.width / 3 + 8, this.y + this.height - 3, 3, 3);
        }
        // player moving left
        else if (this.movingLeft)
        {
            // eyes
            context.fillStyle = 'white'
            context.fillRect(this.x, this.y + this.height / 3 - 2, 3, 3);
            context.fillStyle = 'white'
            context.fillRect(this.x, this.y + this.height / 3 + 8, 3, 3);
        }
        // player moving right
        else if (this.movingRight)
        {
            // eyes
            context.fillStyle = 'white'
            context.fillRect(this.x + this.width - 3, this.y + this.height / 3 - 2, 3, 3);
            context.fillStyle = 'white'
            context.fillRect(this.x + this.width - 3, this.y + this.height / 3 + 8, 3, 3);
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
        sceneManager.currentScene.pickups.forEach(pickup =>
        {
            //check top/bottom
            if (this.top() < pickup.bottom() && this.bottom() > pickup.top())
            {
                // check left/right
                if (this.left() < pickup.right() && this.right() > pickup.left())
                {
                        if (pickup.type === 'gold')
                        {
                            // add gold
                            this.gold += pickup.value;
                            // remove pickup
                            currentScene.pickups.splice(currentScene.pickups.indexOf(pickup), 1);
                        }
                        else if (pickup.type === 'food')
                        {
                            // add health
                            this.health += pickup.value;
                            // prevent overhealing
                            if (this.health > 100)
                            {
                                this.health = 100;
                            }
                            // remove pickup
                            currentScene.pickups.splice(currentScene.pickups.indexOf(pickup), 1);
                        }
                }
            }
        })

        // check collisions with enemies of scene
        sceneManager.currentScene.enemies.forEach(enemy =>
        {
            // check if enemy is alive
            if (enemy.alive)
            {
                //check top/bottom
                if (this.top() < enemy.bottom() && this.bottom() > enemy.top())
                {
                    // check left/right
                    if (this.left() < enemy.right() && this.right() > enemy.left())
                    {
                            this.takeDamage(10);
                            this.knockback(enemy);
                    }
                }
            }
        })

        // check collisions with boss
        sceneManager.currentScene.boss.forEach(boss =>
        {
            //check top/bottom
            if (this.top() < boss.bottom() && this.bottom() > boss.top())
            {
                // check left/right
                if (this.left() < boss.right() && this.right() > boss.left())
                {
                    // player moving up
                    if (this.movingUp)
                    {
                        this.y = boss.bottom();
                    }
                    // player moving down
                    else if (this.movingDown)
                    {
                        this.y = boss.top() - this.height;
                    }
                    // player moving left
                    else if (this.movingLeft)
                    {
                        this.x = boss.right();
                    }
                    // player moving right
                    else if (this.movingRight)
                    {
                        this.x = boss.left() - this.width;
                    }
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
                        if (enemy.alive)
                        {
                            enemy.takeDamage(this.damage);
                            enemy.knockback(30);
                            this.active = false;
                        }
                    }
                }
            }
        })

        // check for collisions with boss
        sceneManager.currentScene.boss.forEach(boss =>
        {
            // check if hitbox is active
            if (this.active)
            {
                //check top/bottom
                if (this.top() < boss.bottom() && this.bottom() > boss.top())
                {
                    // check left/right
                    if (this.left() < boss.right() && this.right() > boss.left())
                    {
                        if (boss.alive)
                        {
                            boss.takeDamage(this.damage);
                            this.active = false;
                        }
                    }
                }
            }
        })
    }
}

class Shield extends Rectangle
{
    constructor (blockPower)
    {
        super(player.x + player.width, player.y + player.height / 4, 30, 15, 'brown');
        this.blockPower = blockPower;
        this.active = false;
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
                        // check if enemy is alive
                        if (enemy.alive)
                        {
                            enemy.knockback(50);

                            // rewind block audio and play it
                            blockAudio.currentTime = 0;
                            blockAudio.play();
                        }
                    }
                }
            }
        })
    }
}

class Skill extends Rectangle
{
    constructor (type)
    {
        super(player.x - player.width, player.y - player.height, player.width * 3, player.height * 3, 'pink');
        this.type = type;
        this.damage = 10;
        this.active = false;
    }

    render ()
    {
        super.render();

        this.x = player.x - player.width;
        this.y = player.y - player.height;

        // check if skill hitbox is active
        if (this.active)
        {
            // check for collisions with enemies
            sceneManager.currentScene.enemies.forEach(enemy =>
                {
                    //check top/bottom
                    if (this.top() < enemy.bottom() && this.bottom() > enemy.top())
                    {
                        // check left/right
                        if (this.left() < enemy.right() && this.right() > enemy.left())
                        {
                            if (enemy.alive)
                            {
                                enemy.takeDamage(this.damage);
                                enemy.knockback(80);
                        }
                    }
                }
            })
            
            // check for collisions with boss
            sceneManager.currentScene.boss.forEach(boss =>
                {
                //check top/bottom
                if (this.top() < boss.bottom() && this.bottom() > boss.top())
                {
                    // check left/right
                    if (this.left() < boss.right() && this.right() > boss.left())
                    {
                        if (boss.alive)
                        {
                            boss.takeDamage(this.damage);
                            this.active = false;
                        }
                    }
                }
            })
        }
    }
}

class Enemy extends Rectangle
{
    constructor (x, y, dir, minion)
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
        this.attacking = false;
        this.isBoss = false;
        this.minion = minion;

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

        // drop gold
        currentScene.pickups.push(new Pickup(this.x - 5, this.y - 5, 'yellow', 'gold', 20));
        //1:5 chance to drop food
        if (Math.floor(Math.random() * 5) === 0 && !this.minion)
        {
            currentScene.pickups.push(new Pickup(this.x + this.width + 5, this.y + this.height + 5, 'salmon', 'food', 50));
        }

        // remove enemy
        currentScene.enemies.splice(currentScene.enemies.indexOf(this), 1);
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

    render ()
    {
        super.render();

        // check if enemy is alive
        if (this.alive)
        {
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

                    // freeze enemy on axis to prevent clipping through walls on chase
                    // enemy moving up
                    if (this.movingUp)
                    {
                        this.y = this.prevY;
                        this.newDirection();
                    }
                    // enemy moving down
                    else if (this.movingDown)
                    {
                        this.y = this.prevY;
                        this.newDirection();
                    }
                    // enemy moving left
                    else if (this.movingLeft)
                    {
                        this.x = this.prevX;
                        this.newDirection();
                    }
                    // enemy moving right
                    else if (this.movingRight)
                    {
                        this.x = this.prevX;
                        this.newDirection();
                    }                    
                }

            }
        })
        // check collisions with other enemies in scene
        sceneManager.currentScene.enemies.forEach(enemy =>
        {
            //check top/bottom
            if (this.top() < enemy.bottom() && this.bottom() > enemy.top())
            {
                // check left/right
                if (this.left() < enemy.right() && this.right() > enemy.left())
                {
                    // check if enemy is alive
                    if (enemy.alive && this.alive)
                    {
                        // enemy moving up
                        if (this.movingUp && this.bottom() > enemy.bottom())
                        {
                            this.y = enemy.bottom() + 5;
                            this.newDirection();
                        }
                        // enemy moving down
                        else if (this.movingDown && this.top() < enemy.top())
                        {
                            this.y = enemy.top() - this.height - 5;
                            this.newDirection();
                        }
                        // enemy moving left
                        else if (this.movingLeft && this.right() > enemy.right())
                        {
                            this.x = enemy.right() + 5;
                            this.newDirection();
                        }
                        // enemy moving right
                        else if (this.movingRight && this.left() < enemy.left())
                        {
                            this.x = enemy.left() - this.width - 5;
                            this.newDirection();
                        }
                    }
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
        
        // check if outside canvas
        if (this.top() <= 0)
        {
            this.y = 0;
        }
        if (this.bottom() >= canvas.height)
        {
            this.y = canvas.height;
        }
        if (this.left() <= 0)
        {
            this.x = 0;
        }
        if (this.right() >= canvas.width)
        {
            this.x = canvas.width;
        }
        
    }
}

class Boss extends Rectangle
{
    constructor (x, y)
    {
        super(x, y, 100, 100, 'black');
        this.health = 100;
        this.maxHealth = 100;
        this.alive = true;
        this.fightStarted = false;
        this.shielded = false;
    }

    takeDamage (damage)
    {
        if (this.alive)
        {
            // if not invulnerable
            if (!this.shielded)
            {
                this.health -= damage;
            }
            // check for death
            if (this.health <= 0)
            {
                this.die();
            }
        }
    }

    die ()
    {
        this.alive = false;
        this.color = 'orange';
        // die after 3 seconds
        setTimeout(function()
        {
            sceneManager.currentScene.boss.splice(0, 1);
        }, 3000)
    }

    summonEnemies ()
    {
        let enemies = [];
        // above 50% hp
        if (boss.health >= 50)
        {
            enemies = [
                new Enemy(300, 125, 'left', true),
                new Enemy(300, 375, 'left', true)
            ]
        }
        // below 50% hp
        if (boss.health < 50)
        {
            enemies = [
                new Enemy(300, 105, 'left', true),
                new Enemy(300, 145, 'left', true),
                new Enemy(300, 355, 'left', true),
                new Enemy(300, 395, 'left', true)
            ]
        }

        enemies.forEach(enemy =>
        {
            sceneManager.currentScene.enemies.push(enemy);
        })
    }

    render ()
    {
        super.render();

        // check if boss is alive
        if (this.alive)
        {
            // boss fight
            // summon 2/4 minions while above/below 50% hp, all minions must be killed before being able to damage the boss for a short period of time

            // if first render
            if (!this.fightStarted)
            {
                // summon 2 minions; start fight
                this.summonEnemies();
                this.fightStarted = true;
            }

            // if minions are alive
            if (sceneManager.currentScene.enemies.length > 0)
            {
                this.shielded = true;
            }
            
            // if in shielded state
            if (this.shielded)
            {
                this.color = 'cyan';

                if (sceneManager.currentScene.enemies.length <= 0)
                {
                    this.shielded = false;
                    this.color = 'black';
                    // resummon minions after 5 seconds
                    setTimeout(this.summonEnemies, 5000);
                }
            }
        }
        // dead
        else
        {
            sceneManager.currentScene.enemies = [];
        }
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
        if (sceneManager.currentScene.enemies.length > 0 || sceneManager.currentScene.boss.length > 0)
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
    if (event.key === 'w' && gameRunning && !gamePaused)
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
    if (event.key === 'd' && gameRunning && !gamePaused)
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
    if (event.key === 'a' && gameRunning && !gamePaused)
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
    if (event.key === 's' && gameRunning && !gamePaused)
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
    
    // game menu
    if (event.key === 'Escape' && gameRunning)
    {
        if (gameMenu.classList.contains('hidden') && gameMenuControls.classList.contains('hidden'))
        {
            // open game menu
            gameMenu.classList.remove('hidden');
            gamePaused = true;
            bkgrndMusic.pause();
        }
        else
        {
            // return to game
            gameMenu.classList.add('hidden');
            gamePaused = false;
            bkgrndMusic.play();
        }
    }

    // player ability
    if (event.key === ' ' && gameRunning && !gamePaused)
    {
        if (player.canUseAbility)
        {
            player.ability();
        }
    }
});

// player attack
document.addEventListener('click', () =>
{
    if (!player.attacking && player.canAttack && !gamePaused)
    {
        player.attack();
    }
})

// player block
document,addEventListener('auxclick', (event) =>
{
    event.preventDefault();

    if (!player.attacking && player.canBlock && !gamePaused)
    {
        player.block();
    }
})

// play game
playGame.addEventListener('click', () =>
{
    reset();
    currentScene = scene0;
    bkgrndMusic.play();
})

// controls
controlsButton.addEventListener('click', () =>
{
    currentScene = controlsScene;
})

// return to main menu
returnButton.addEventListener('click', () =>
{
    currentScene = mainMenuScene;
})
// return to main menu
winReturnButton.addEventListener('click', () =>
{
    currentScene = mainMenuScene;
})
// return to main menu
loseReturnButton.addEventListener('click', () =>
{
    currentScene = mainMenuScene;
})
// game menu controls
gameMenuControlsButton.addEventListener('click', () =>
{
    gameMenuControls.classList.remove('hidden');
    // gameMenu.classList.add('hidden');
})
// game menu controls return - return to game menu
gameMenuControlsReturn.addEventListener('click', () =>
{
    gameMenuControls.classList.add('hidden');
    gameMenu.classList.remove('hidden');
})
// return to main menu from game menu
gameMenuReturn.addEventListener('click', () =>
{
    currentScene = mainMenuScene;
})

/***** Scenes  *****/

// array of scenes
let scenes = [];
let randomScenes = [];

// create scene
let scene0 = new Scene('start');

// create scene
let scene1 = new Scene('4-corners');

let scene2 = new Scene('equal-sign');

let scene3 = new Scene('cross');

let scene4 = new Scene('corner-pockets');

// boss scene
let scene5 = new Scene('boss');
const boss = new Boss(325, 200);

// win screen
const winScene = new Scene('win');

// lose screen
const loseScene = new Scene('lose');

// main menu screen
const mainMenuScene = new Scene('mainMenu');

// controls screen
const controlsScene = new Scene('controls');

/***** Setup *****/

// create player
const player = new Player(235, 235, 30, 30, 'blue');
player.weapon = new Weapon(5);
player.shield = new Shield(50);
player.skill = new Skill('slam');

// start time for timer
let startTime;

// scene manager
let sceneManager = new SceneManager(scenes);

// first scene - main menu
let currentScene = mainMenuScene;

/*===================== Game Loop ======================*/
// Static frame rate of 50FPS
const frame = setInterval(() =>
{
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // render scene
    sceneManager.loadScene(currentScene);
    // render player
    player.render();
    // check for collisions
    player.isCollidingWith();
    // timer
    timer();
}, 16.67);
/*======================================================*/


/***** Functions *****/

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
}

// remake all scenes
function reset ()
{
    // get time
    startTime = Date.now();

    // array of scenes
    scenes = [];
    randomScenes = [];

    // start scene
    scene0.makeScene([], [], true, false)
    // add scene to scene list
    scenes.push(scene0);

    // 4-corners scene
    scene1.makeScene([[2,2], [7,2], [2,7], [7,7]], [
        new Enemy(400, 240, 'left', false),
        new Enemy(230, 350, 'right', false),
        new Enemy(230, 150, 'up', false)
    ], false, false)
    // add scene to scene list
    randomScenes.push(scene1);

    // equal sign scene
    scene2.makeScene([[3,3], [4,3], [5,3], [6,3], [3,6], [4,6], [5,6], [6,6]], [
        new Enemy(250, 400, 'down', false),
        new Enemy(300, 250, 'left', false),
        new Enemy(250, 100, 'left', false),
    ], false, false)
    randomScenes.push(scene2);

    // cross scene
    scene3.makeScene([[2, 2], [3, 3], [4, 4], [5, 4], [6, 3], [7, 2], [2, 7], [3, 6], [4, 5], [5, 5], [6, 6], [7, 7]], [
        new Enemy(260, 55, 'right', false),
        new Enemy(260, 445, 'left', false)
    ], false, false)
    randomScenes.push(scene3);

    // corner pockets scene
    scene4.makeScene([[2, 3], [3, 3], [3, 2], [6, 2], [6, 3], [7, 3], [2, 6], [3, 6], [3, 7], [6, 6], [6, 7], [7, 6]], [
        new Enemy(220, 230, 'right', false),
        new Enemy(350, 230, 'left', false),
        new Enemy(240, 100, 'down', false),
        new Enemy(240, 400, 'up', false)
    ], false, false)
    randomScenes.push(scene4);

    // shuffle random scenes array
    shuffle(randomScenes);
    // push randomized scenes to main scenes array
    randomScenes.forEach(scene =>
    {
        scenes.push(scene);
    })

    // boss scene
    scene5.makeScene([[7, 2], [7, 7]], [boss], false, true);
    scenes.push(scene5);

    // win scene
    scenes.push(winScene);

    // reset player and boss properties
    player.x = 235;
    player.y = 235;
    player.health = 100;
    player.gold = 0;
    boss.alive = true;
    boss.health = 100;
    boss.fightStarted = false;

    // rewind background music
    bkgrndMusic.currentTime = 0;

    // import scenes to scene manager
    sceneManager.scenes = scenes;
}

function timer ()
{
    // ticks every ~1000ms
    if (Date.now() - startTime >= 1000)
    {
        // update timer
        time += 1;
        timeUI.textContent = `Time: ${time}`;
        // set new start time
        startTime = Date.now();
    }
}


/***** Sounds *****/
const bkgrndMusic = document.querySelector('#bkgrndMusic');
const attackAudio = document.querySelector('#attackAudio');
const hurtAudio = document.querySelector('#hurtAudio');
const slamAudio = document.querySelector('#slamAudio');
const blockAudio = document.querySelector('#blockAudio');
const bossAudio = document.querySelector('#bossAudio');