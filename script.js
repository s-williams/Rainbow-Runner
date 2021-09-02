kaboom({
    global: true,
    width: 480,
    height: 360,
    scale: 2,
    clearColor: [0, 0, 0, 1],
    crisp: false,
    debug: false,
});

const PLAYERX = 40;
const PLAYERJUMP = 600;
const PLAYERTERMINALVEL = 2400;
const BASESPEED = 125;
const SCALE = 1.5;
let highScore = 0;

// Tilemap
loadSprite("tiles", "./gfx/tilemap.png", {
    sliceX: TILESIZE,
    sliceY: TILESIZE,
    anims: {
        idle: { from: 300, to: 300 },
        run: { from: 301, to: 303 },
        jump: { from: 304, to: 304 },
        fall: { from: 305, to: 305 },
        dead: { from: 306, to: 306 },
        groundEnemy: { from: 341, to: 342 },
        airEnemy: {from: 380, to: 381 },
    }
});
// Tilemape frames
const GROUND = 271;

scene("game", (hScore) => {
    highScore = hScore;
    let score = 0;

    /*
     * Player
     */
    const player = add([
        sprite("tiles", {
            animSpeed: 0.15,
            frame: 300,
        }),
        area(vec2(-4, 0), vec2(4, 8)),
        pos(16 * 6, 16),
        color(1, 0, 0),
        origin("center"),
        scale(SCALE),
        body({
            jumpForce: PLAYERJUMP,
            maxVel: PLAYERTERMINALVEL,
        }),
        {
            speed: BASESPEED,
            alive: true,
        },
        "player",
    ]);
    action("player", (player) => {
        player.pos.x = PLAYERX;

        // Falling off the screen
        if (player.pos.y > height()) {
            player.alive = false;
        }

        // Speed up with time
        player.speed = BASESPEED + (BASESPEED * timerLabel.time / 800)
    });
    // Jump with space
    let jumpPower = 0;
    let heldSince = 0;
    keyDown("space", () => {
        heldSince += dt();
        if (heldSince > 0 && jumpPower === 0) {
            jumpPower = 2 * PLAYERJUMP / 3;
        }
        if (heldSince > 0.5 && jumpPower === 2 * PLAYERJUMP / 3) {
            if (player.alive) {
                camShake(2);
            }
            jumpPower = 2.5 * PLAYERJUMP / 3;
        }
        if (heldSince > 1.0 && jumpPower === 2.5 * PLAYERJUMP / 3) {
            if (player.alive) {
                camShake(5);
            }
            jumpPower = 3 * PLAYERJUMP / 3;
            if (!player.alive) {
                go("game", highScore);
            }
        }
    });
    keyRelease("space", () => {
        // These 2 functions are provided by body() component
        if (player.grounded() && player.alive) {
            player.jump(jumpPower);
            player.play("jump");
        }
        heldSince = 0;
        jumpPower = 0;
    });
    player.on("grounded", () => {
        if (player.alive) {
            player.play("run");
        }
    });

    /*
     * Obstacles
     */
    // For everything scrolling at the player's speed
    action("scroll", (thing) => {
        if (player.alive) {
            thing.move(-player.speed, 0);
            if (thing.pos.x < -TILESIZE) {
                destroy(thing);
            }
        }
    });
    // Set up the initial ground
    let initialGround = () => {
        // Spawn ground
        for (let i = 0; i < width() / TILESIZE; i++) {
            spawnGround((TILESIZE + 4) * i);
        }
    };
    // When ground is destroyed, spawn in more ground
    on("destroy", "ground", (g) => {
        spawnGround();
    });
    let spawnGround = (x=width()+TILESIZE) => {
        add([sprite("tiles", {
                frame: GROUND,
            }),
            solid(),
            color(1, 0, 0),
            origin("center"),
            scale(SCALE),
            pos(x, height() * 0.7),
            "scroll",
            "ground"
        ]);
    };
    initialGround();
    // Spawn Obstacles
    let spawnObstacle = () => {
        let choice = rand(0, 6);
        if (choice < 4) {
            // Spawn ground enemy
            let enemy = add([sprite("tiles", {
                    animSpeed: 0.2,
                }),
                color(1, 0, 0),
                origin("center"),
                scale(SCALE),
                pos(width() + TILESIZE, height() * 0.7 - TILESIZE - 5),
                "scroll",
                "obstacle"
            ]);
            enemy.play("groundEnemy")
            if (choice > 2 && choice < 3) {
                let doubleEnemy = add([sprite("tiles", {
                        animSpeed: 0.2,
                    }),
                    color(1, 0, 0),
                    origin("center"),
                    scale(SCALE),
                    pos(width() + rand(2,3) * TILESIZE, height() * 0.7 - TILESIZE - 5),
                    "scroll",
                    "obstacle"
                ]);
                doubleEnemy.play("groundEnemy");
            }
            if (choice > 3 && choice < 4) {
                // Spawn air enemy
                let enemy = add([sprite("tiles", {
                        animSpeed: 0.2,
                    }),
                    color(1, 0, 0),
                    origin("center"),
                    scale(SCALE),
                    pos(width() + TILESIZE, height() * rand(0.25,0.35) - TILESIZE - 5),
                    "scroll",
                    "obstacle"
                ]);
                enemy.play("airEnemy")
            }
        } else {
            // Spawn air enemy
            let enemy = add([sprite("tiles", {
                    animSpeed: 0.2,
                }),
                color(1, 0, 0),
                origin("center"),
                scale(SCALE),
                pos(width() + TILESIZE, height() * rand(0.25,0.35) - TILESIZE - 5),
                "scroll",
                "obstacle"
            ]);
            enemy.play("airEnemy")
        }
    };
    let spawnForever = () => {
        spawnObstacle();
        let waitThis = 5 - timerLabel.time / 1000;
        wait(waitThis, () => spawnForever());
    }
    player.collides("obstacle", () => {
        if (player.alive) {
            player.play("dead");
            player.alive = false;
            camShake(12);
            gameOver.hidden = false;
            resetMessage.hidden = false;
        }
    });
    /*
     * Interface
     */
    // Scoring
    let timerLabel = add([
        text(0),
        layer("ui"),
        pos(width() - 5, 5),
        origin("topright"),
        {
            time: 0,
        },
    ]);
    timerLabel.action(() => {
        if (player.alive) {
            timerLabel.time += dt();
            timerLabel.text = String(timerLabel.time.toFixed(1) * 10).padStart(10, 0);
        }
        if (timerLabel.text > highScore) {
            highScore = timerLabel.text;
        }
    });
    let hiScore = add([
        text(0),
        layer("ui"),
        pos(5, 5),
        origin("topleft"),
        {
            time: 0,
        },
    ]);
    hiScore.action(() => {
        if (timerLabel.text > highScore) {
            timerLabel.text = highScore;
        }
        hiScore.text = "HI " + highScore;
    });

    //Reset
    keyPress("r", () => {
        go("game", highScore);
    });
    keyPress("escape", () => {
        go("menu", highScore);
    });
    let gameOver = add([
        text("GAME OVER"),
        layer("ui"),
        scale(1.5),
        pos(width()/2, height() * 0.85),
        origin("center"),
        { hidden: true }
    ]);
    let resetMessage = add([
        text("ESC OR R"),
        layer("ui"),
        scale(1.5),
        pos(width()/2, height() * 0.9),
        origin("center"),
        { hidden: true }
    ]);

    //Start
    spawnForever();
});