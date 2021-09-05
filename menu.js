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

scene("menu", (highScore) => {
   add([
        text(String(0).padStart(10, 0)),
        layer("ui"),
        pos(width() - 5, 5),
        origin("topright")
    ]);
    add([
        text("HI " + String(highScore).padStart(10, 0)),
        layer("ui"),
        pos(5, 5),
        origin("topleft"),
        {
            time: 0,
        },
    ]);
    add([
        text("Rainbow Runner"),
        pos(240, 80),
        origin("center"),
        scale(3),
    ]);
    add([
        sprite("tiles", {
            animSpeed: 0.15,
            frame: 300,
        }),
        area(vec2(-4, 0), vec2(4, 8)),
        pos(240, 160),
        color(1, 1, 1),
        origin("center"),
        scale(1.5),
        "player",
    ]);
    add([
        rect(160, 20),
        pos(240, 270),
        origin("center"),
        "button",
        {
            clickAction: () => go('game', highScore),
        },
    ]);
    add([
        text("Play game"),
        pos(240, 270),
        origin("center"),
        color(0, 0, 0)
    ]);
    add([
        rect(160, 20),
        pos(240, 300),
        origin("center"),
        "button",
        {
            clickAction: () => go('credits', highScore),
        },
    ]);
    add([
        text("Credits"),
        pos(240, 300),
        origin("center"),
        color(0, 0, 0)
    ]);
    // Music and SFX mute buttons
    add([
        rect(70, 20),
        pos(195, 330),
        origin("center"),
        "button",
        {
            clickAction: () => {
                musicMuted = !musicMuted;
                musicText.text = musicMuted ? "Muted" : "Music";
            }
        },
    ]);
    let musicText = add([
        text(musicMuted ? "Muted" : "Music"),
        pos(195, 330),
        origin("center"),
        color(0, 0, 0)
    ]);
    add([
        rect(70, 20),
        pos(285, 330),
        origin("center"),
        "button",
        {
            clickAction: () => {
                sfxMuted = !sfxMuted;
                sfxText.text = sfxMuted ? "Muted" : "SFX";
            }
        },
    ]);
    let sfxText = add([
        text(sfxMuted ? "Muted" : "SFX"),
        pos(285, 330),
        origin("center"),
        color(0, 0, 0)
    ]);
    action("button", b => {
        if (b.isHovered()) {
            b.use(color(0.7, 0.7, 0.7));
        } else {
            b.use(color(1, 1, 1));
        }

        if (b.isClicked()) {
            b.clickAction();
        }
    });
    keyPress("space", () => { go('game', highScore); });
    keyPress("enter", () => { go('game', highScore); });
    keyPress("1", () => { go('game', highScore); });
    keyPress("2", () => { go('credits', highScore); });
});

scene("credits", (highScore) => {
   add([
        text(String(0).padStart(10, 0)),
        layer("ui"),
        pos(width() - 5, 5),
        origin("topright")
    ]);
    add([
        text("HI " + String(highScore).padStart(10, 0)),
        layer("ui"),
        pos(5, 5),
        origin("topleft"),
        {
            time: 0,
        },
    ]);
    add([
        rect(160, 20),
        pos(240, 300),
        origin("center"),
        "button",
        {
            clickAction: () => go('menu', highScore),
        },
    ]);
    add([
        text("Back"),
        pos(240, 300),
        origin("center"),
        color(0, 0, 0)
    ]);
    add([
        text("Programming:"),
        pos(240, 60),
        origin("center"),
        scale(1),
    ]);
    add([
        text("swilliamsio"),
        pos(240, 80),
        origin("center"),
        scale(2),
    ]);
    add([
        text("https://www.swilliams.io/"),
        pos(240, 100),
        origin("center"),
        scale(1),
        "button",
        {
            clickAction: () => {
                window.open("https://www.swilliams.io/", '_blank');
            }
        },
    ]);
    add([
        text("GFX/SFX:"),
        pos(240, 140),
        origin("center"),
        scale(1),
    ]);
    add([
        text("Kenney"),
        pos(240, 160),
        origin("center"),
        scale(2),
    ]);
    add([
        text("https://www.kenney.nl/"),
        pos(240, 180),
        origin("center"),
        scale(1),
        "button",
        {
            clickAction: () => {
                window.open("https://www.kenney.nl/", '_blank');
            }
        },
    ]);
    add([
        text("Music:"),
        pos(240, 220),
        origin("center"),
        scale(1),
    ]);
    add([
        text("WaxTerK - Puzzle Cat"),
        pos(240, 240),
        origin("center"),
        scale(2),
    ]);
    add([
        text("https://www.newgrounds.com/audio/listen/1056740"),
        pos(240, 260),
        origin("center"),
        scale(1),
        "button",
        {
            clickAction: () => {
                window.open("https://www.newgrounds.com/audio/listen/1056740", '_blank');
            }
        },
    ]);
    action("button", b => {
        if (b.isHovered()) {
            b.use(color(0.7, 0.7, 0.7));
        } else {
            b.use(color(1, 1, 1));
        }
        if (b.isClicked()) {
            b.clickAction();
        }
    });
    keyPress("escape", () => { go('menu', highScore); });
    keyPress("1", () => { go('menu', highScore); });
    keyPress("2", () => { go('menu', highScore); });
    keyPress("3", () => { go('menu', highScore); });
});

start("menu", 0);