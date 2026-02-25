import { GAME_TILE } from "@/lib/constants";
import { GameAPIInterface } from "@/lib/types";
import { useEffect, useRef } from "react";

interface GamePlaySectionProps {
  resolution?: {width: number; height: number};
  style?: React.CSSProperties;
  onReady?: (api: GameAPIInterface) => void;
  setPermission?: React.Dispatch<React.SetStateAction<string>>;
}

//원래 player 는 일반인이었다가, 튜토리얼 겸 움직이다가 박스에서 노트북을 얻어 개발자가 되면 terminal 이 보이는 구조?
//admin / idiot / guest 일때 생김새가 다 다르고, 할수있는 명령어도 다르게

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureAnim(spr: any, name: "idle" | "run" | "jump") {
  if (spr.currentAnim !== name) {
    spr.currentAnim = name;
    spr.play(name);
  }
}

export default function GamePlaySection({
  resolution = { width: 512, height: 288 },
  style,
  onReady,
  setPermission,
}: GamePlaySectionProps) {
  const playSectionRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const height = Math.floor(resolution.height / GAME_TILE);
  const width = Math.floor(resolution.width / GAME_TILE);
  console.log("GamePlaySection rendered with resolution", resolution, "=> grid size", width, "x", height);
  const xy = (x: number, y: number) => [x * GAME_TILE, y * GAME_TILE] as const;

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    let handleCleanUp: (() => void) | null = null;

    (async () => {
      const kaboom = (await import("kaboom")).default;
      const root = playSectionRef.current;
      if (root?.hasChildNodes()) root.replaceChildren(); // Clear previous content
      if (!root) return;
      const k = kaboom({
        global: false,
        root,
        width: resolution.width,
        height: resolution.height,
        background: [38, 198, 218],
        pixelDensity: 1,
        stretch: true,
        letterbox: true,
      });
      kRef.current = k;

      k.canvas.tabIndex = 0;

      const handleFocus = () => k.canvas.focus();
      root.addEventListener("pointerdown", handleFocus);
      const {
        loadSprite,
        scene,
        add,
        sprite,
        pos,
        area,
        scale,
        anchor,
        go,
        body,
        onKeyDown,
        onKeyRelease,
        onKeyPress,
        onUpdate,
        setGravity,
        destroy,
        Rect,
        Vec2,
        vec2,
        text,
        rect,
        color,
        follow,
        wait,
        opacity,
        z,
      } = k;
      setGravity(2000);
      
      // load sprites
      await Promise.all([
        loadSprite("player", "/sprites/player.png", {
          sliceX: 8,
          anims: {
            idle: { from: 0, to: 3, loop: true, speed: 4 },
            run: { from: 4, to: 7, loop: true, speed: 4 },
            jump: 2,
          },
        }),
        loadSprite("player_sudo", "/sprites/player.png", {
          sliceX: 8,
          anims: {
            idle: { from: 0, to: 3, loop: true, speed: 4 },
            run: { from: 4, to: 7, loop: true, speed: 4 },
            jump: 2,
          },
        }),
        loadSprite("ground", "/sprites/ground.png"),
        loadSprite("box", "/sprites/box.png", {
          sliceX: 3,
          anims: { idle: { from: 0, to: 1, loop: true, speed: 6 }, broken: 2 },
        }),
        loadSprite("mushroom", "/sprites/mushroom.png", {
          sliceY: 2,
          anims: { idle: { from: 0, to: 1, loop: true, speed: 4 } },
        }),
        loadSprite("cloud", "/sprites/cloud.png", {
          sliceY: 2,
          anims: { idle: { from: 0, to: 1, loop: true, speed: 8 } },
        }),
        loadSprite("notebook", "/sprites/notebook.png", {
          sliceX: 8,
          anims: { idle: { from: 0, to: 7, loop: true, speed: 4 } },
        }),
      ]);

      // define scene
      scene("game", () => {
        for (let i = 0; i < width; i += 7) {
          add([
            sprite("cloud", { anim: "idle" }),
            pos(...xy(i, (i % 2) + 1)),
            scale(2.0),
            anchor("center"),
            "cloud",
          ]);
        }

        for (let i = 0; i < width; i++) {
          add([
            sprite("ground"),
            pos(...xy(i, height-1)),
            anchor("center"),
            scale(1.5),
            area(),
            body({ isStatic: true }),
            "ground",
          ]);
        }

        add([
          sprite("box", { anim: "idle" }),
          pos(...xy(width / 2, height-8)),
          anchor("bot"),
          area(),
          scale(2.0),
          body({ isStatic: true }),
          "box",
        ]);

        add([
          sprite("notebook", { anim: "idle" }),
          pos(...xy(width * 1 / 3, height-4)),
          anchor("center"),
          area({ shape: new Rect(new Vec2(0), 60, 120), offset: vec2(0, 0) }),
          scale(0.5),
          body({ isStatic: true }),
          "notebook",
        ]);

        const player = add([
          sprite("player", { anim: "idle" }),
          pos(...xy(0.5, 1)),
          anchor("center"),
          area({ shape: new Rect(new Vec2(0), 40, 100), offset: vec2(0, 8) }),
          body(),
          scale(1),
          "player",
          { speed: 160, canDouble: false, permission: "guest" },
        ]);

        onKeyDown("left", () => {
          player.move(-(player).speed, 0);
          player.flipX = true;
          ensureAnim(player, "run");
        });
        onKeyDown("right", () => {
          player.move((player).speed, 0);
          player.flipX = false;
          ensureAnim(player, "run");
        });
        onKeyPress("space", () => {
          if (player.isGrounded()) {
            player.jump(GAME_TILE * 15);
            player.play("jump");
          }
        });
        onKeyRelease("left", () => ensureAnim(player, "idle"));
        onKeyRelease("right", () => ensureAnim(player, "idle"));
        onUpdate(() => {
          if (!player.isGrounded()) ensureAnim(player, "jump");
          else if (!k.isKeyDown("left") && !k.isKeyDown("right"))
            ensureAnim(player, "idle");
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.onCollide("box", (b: any) => {
          const hitFromBelow = player.vel.y < 0 && player.pos.y > b.pos.y;
          if (!hitFromBelow) return;
          b.frame = 2;
          if (player.vel.y < 0) player.vel.y = 180;
        });


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.onCollide("notebook", (b: any) => {
          setPermission?.("guest");
          player.use(sprite("player_sudo", { anim: "idle" }));
          destroy(b);
        });

        const api: GameAPIInterface = {
          exec: (cmd, args) => {
            switch (cmd) {
              case "tp": {
                // tp <gridX> <gridY>
                const gx = Number(args[0]),
                  gy = Number(args[1]);
                if (!Number.isFinite(gx) || !Number.isFinite(gy))
                  return "usage: tp <gridX> <gridY>";
                const [px, py] = xy(gx, gy);
                player.pos = k.vec2(px, py);
                return `teleported to ${gx},${gy}`;
              }
              case "speed": {
                // speed [value]
                if (args[0] == null) return `speed=${(player).speed}`;
                const s = Number(args[0]);
                if (!Number.isFinite(s)) return "usage: speed <number>";
                (player).speed = s;
                return `speed=${s}`;
              }
              case "jump": {
                // jump [forceTiles]
                const f = Number(args[0] ?? 15);
                player.jump(GAME_TILE * (Number.isFinite(f) ? f : 15));
                return `jump ${f}`;
              }
              case "gravity": {
                // gravity <value>
                const g = Number(args[0]);
                if (!Number.isFinite(g)) return "usage: gravity <number>";
                setGravity(g);
                return `gravity=${g}`;
              }
              case "spawn": {
                // spawn box|mushroom [gx] [gy]
                const kind = args[0];
                const gx = Number(args[1] ?? Math.floor(width / 2));
                const gy = Number(args[2] ?? 1.5);
                if (!Number.isFinite(gx) || !Number.isFinite(gy))
                  return "usage: spawn box|mushroom [gridX] [gridY]";
                if (kind === "box") {
                  add([
                    sprite("box", { anim: "idle" }),
                    pos(...xy(gx, gy)),
                    anchor("center"),
                    area(),
                    body({ isStatic: true }),
                    "box",
                  ]);
                  return `spawned box at ${gx},${gy}`;
                }
                if (kind === "mushroom") {
                  add([
                    sprite("mushroom", { anim: "idle" }),
                    pos(...xy(gx, gy)),
                    anchor("center"),
                    scale(1.7),
                    area({ shape: new Rect(new Vec2(0), 32, 27), offset: vec2(0, 1) }),
                    body(),
                    "mushroom",
                  ]);
                  return `spawned mushroom at ${gx},${gy}`;
                }
                return "usage: spawn box|mushroom [gridX] [gridY]";
              }
              case "reset": {
                // reset scene
                go("game");
                return "scene reset";
              }
              default:
                return undefined; // Terminal이 builtins로 폴백
            }
          },
          showBubble: () => {
            // 이전 말풍선이 있으면 제거
            k.destroyAll("bubble");

            // 말풍선 배경 (흰색 둥근 사각형)
            const bubbleBg = add([
              rect(32, 28, { radius: 6 }),
              color(255, 255, 255),
              anchor("bot"),
              pos(0, 0),
              follow(player, vec2(20, -50)),
              opacity(0.95),
              z(100),
              "bubble",
            ]);

            // "?" 텍스트
            add([
              text("?", { size: 20 }),
              color(0, 0, 0),
              anchor("center"),
              pos(0, 0),
              follow(bubbleBg, vec2(0, -14)),
              z(101),
              "bubble",
            ]);

            // 말풍선 꼬리 (작은 삼각형 대용 — 작은 사각형)
            add([
              rect(8, 8, { radius: 2 }),
              color(255, 255, 255),
              anchor("top"),
              pos(0, 0),
              follow(player, vec2(20, -22)),
              opacity(0.95),
              z(99),
              "bubble",
            ]);

            // 2초 후 자동 제거
            wait(2, () => {
              k.destroyAll("bubble");
            });
          },
        };

        onReady?.(api);
      });

      // start
      k.go("game");

      handleCleanUp = () => {
        root.removeEventListener("pointerdown", handleFocus);
        k.quit();
      };

    })();

    return () => {
      handleCleanUp?.();
      kRef.current = null;
      isInitializedRef.current = false;
    };
  }, [resolution.width, resolution.height, onReady, width, height])

  return (
    <div
      ref={playSectionRef}
      className="pixelated"
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
}