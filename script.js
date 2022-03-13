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
const PLAYERJUMP = 500;
const PLAYERTERMINALVEL = 2400;
const BASESPEED = 150;
const BASESPAWNTIME = 4;
const SPEEDUP = 350; // Lower is faster
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

loadSound("dead", "sfx/dead.ogg");
loadSound("jump", "sfx/jump.ogg");
loadSound("chirp", "sfx/chirp.ogg");
loadSound("music", "sfx/music.mp3");

scene("game", (hScore) => {
    highScore = hScore;

    const music = play("music", {
        loop: true,
        volume: musicMuted ? 0 : 1.00
    });

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
        color(1, 1, 1),
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
        if ((player.pos.y > height() || player.pos.y < 0) && player.alive) {
            die();
        }

        // Speed up with time
        player.speed = BASESPEED + (BASESPEED * timerLabel.time / SPEEDUP)
    });
    // Jump with space
    let heldSince = 0;
    keyDown("space", () => {
        heldSince += dt();
        if (heldSince > 1.0) {
            if (!player.alive) {
                go("game", highScore);
            }
        }
    });
    let jump = () => {
        if (player.grounded() && player.alive) {
            player.jump();
            player.play("jump");
            playSfx("jump");
        }

    };
    keyRelease("space", () => {
        jump();
        heldSince = 0;
    });
    mouseRelease(() => {
        jump();
    })
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
    let spawnGround = (x = width() + TILESIZE) => {
        // Rainbow
        let colour = HSVtoRGB((timerLabel.time * 20 % 255) / 255, 1, 1);
        add([sprite("tiles", {
                frame: GROUND,
            }),
            solid(),
            color(colour.r, colour.g, colour.b),
            origin("center"),
            scale(SCALE),
            pos(x, height() * 0.7),
            "scroll",
            "ground"
        ]);
    };
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
                    pos(width() + TILESIZE, height() * rand(0.55,0.6) - (2 * TILESIZE) - 5),
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
                pos(width() + TILESIZE, height() * rand(0.3,0.6)),
                "scroll",
                "obstacle"
            ]);
            enemy.play("airEnemy")
        }
    };
    on("destroy", "obstacle", () => {
        playSfx("chirp");
    })
    let spawnForever = () => {
        spawnObstacle();
        let waitThis = BASESPAWNTIME - timerLabel.time / SPEEDUP;
        wait(waitThis, () => spawnForever());
    }
    let die = () => {
            player.play("dead");
            player.alive = false;
            music.stop();
            playSfx("dead");
            camShake(12);
            gameOver.hidden = false;
            resetMessage.hidden = false;
    }
    player.collides("obstacle", () => {
        if (player.alive) {
            die();
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

    // Play SFX if its unmuted
    let playSfx = (sfx, volume, detune) => {
        volume = volume || 1.0;
        detune = detune || 0;
        if (!sfxMuted) {
            play(sfx, {
                volume: volume,
                detune: detune,
            });
        }
    };

    //Reset
    keyPress("r", () => {
        go("game", highScore);
        music.stop();
    });
    keyPress("escape", () => {
        go("menu", highScore);
        music.stop();
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
    initialGround();
});