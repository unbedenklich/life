import Engine from "./engine";
import { createTexture } from "./helpers";
import "pixi.js/math-extras";

import { BlobOrganism } from "./organisms/Blob";

import * as PIXI from "pixi.js";
import { Player } from "./Player";
import { Organism } from "./organisms/Organism";
import { Level } from "./Level";
import { WormOrganism } from "./organisms/Worm";
import { sound } from "@pixi/sound";
import { Background } from "./Background";
import {
  AdvancedBloomFilter,
  KawaseBlurFilter,
  ShockwaveFilter,
} from "pixi-filters";
import { NarrationManager } from "./NarrationManager";
import { FishOrganism } from "./organisms/Fish";
import ParticleSystem, { ParticleOptions } from "./Particles";
import UberNoise from "./noise";

declare global {
  var game: Game;
}
let displacementNoise = new UberNoise({
  scale: 0.07,
  min: 0,
  max: 100,
  octaves: 2,
});
let noiseTexture = createTexture(600, 600, (x, y) => {
  const value = displacementNoise.get(x, y);
  return [value, value, value, value];
});

export class Game {
  displacementSprite;

  showDisplacement = false;

  sizes = [
    1.5, 3.0, 6.0, 12.0, 24.0, 48.0, 100.0, 192.0, 384.0, 768.0, 1536.0, 3072.0,
    6144.0,
  ];
  div = "game";
  width = 360 * 3.5;
  height = 360 * 3.5;
  backgroundColor = 0;

  startingLevel = 0;

  // list of organisms of each level
  organisms: Organism[][] = [];
  // list of containers for each level
  containers: PIXI.Container[] = [];

  particles: ParticleSystem;

  player: Player;

  levels: (Level | null)[] = [];

  xpUI: HTMLElement | undefined;

  background: Background;

  winScreenShown = false;

  currentMusic: "music1" | "music2" | "music3" = "music1";

  addXP(amount: number) {
    if (this.xpUI) {
      let itemUI = document.createElement("div");

      itemUI.classList.add("h-full", "transition-all", "duration-200");
      // set color to player stroke color
      // first convert to hex
      itemUI.style.backgroundColor = new PIXI.Color(
        this.player.organism.strokeColor
      ).toHex();
      // set width to percentage dwv
      itemUI.style.width = "0px";
      setTimeout(() => {
        itemUI.style.width = `${amount}%`;
      }, 100);

      this.xpUI.appendChild(itemUI);
    }
  }

  resetXP() {
    if (this.xpUI) {
      this.xpUI.innerHTML = "";
    }
  }

  narrationManager: NarrationManager;

  levelOptions: any = [
    {
      strokeColor: 0,
      fillColor: 0x999999,
      strokeWidth: 0,
      wiggle: false,
    },
    {
      strokeColor: 0xbbbbbb,
      fillColor: 0,
      strokeWidth: 0.2,
    },
    {
      minHue: 50,
      maxHue: 100,
      strokeWidth: 0.4,
    },
    {
      minHue: 150,
      maxHue: 200,
      fillChroma: 0.1,
      strokeChroma: 0.1,
      strokeLightness: 0.5,
      strokeWidth: 0.8,
      particleCount: 10,
    },
    {
      minHue: 100,
      maxHue: 150,
      strokeWidth: 1.6,
      strokeLightness: 0.7,
      strokeChroma: 0.3,

      fillAlpha: 0.8,

      fillLightness: 0.3,
      fillChrome: 0.3,

      organismClass: WormOrganism,
    },

    {
      minHue: 200,
      maxHue: 250,
      strokeWidth: 3.2,
      strokeLightness: 0.7,
      strokeChroma: 0.3,

      fillAlpha: 0.8,

      fillLightness: 0.3,
      fillChrome: 0.3,

      organismClass: WormOrganism,

      jointCount: 6,

      hasEyes: true,
    },
    {
      minHue: 150,
      maxHue: 200,
      strokeWidth: 6.4,
      strokeLightness: 0.7,
      strokeChroma: 0.3,

      fillAlpha: 0.8,

      fillLightness: 0.3,
      fillChrome: 0.3,

      organismClass: WormOrganism,

      jointCount: 9,

      hasEyes: true,
    },
    {
      minHue: 0,
      maxHue: 50,
      strokeWidth: 12.8,

      organismClass: FishOrganism,
    },
    {
      minHue: 200,
      maxHue: 250,
      strokeWidth: 25.6,

      thickness: 1.8,

      showBackFins: true,
      organismClass: FishOrganism,

      points: true,
    },
    {
      minHue: 0,
      maxHue: 50,
      strokeWidth: 51.2,

      thickness: 2.8,

      showBackFins: true,
      organismClass: FishOrganism,

      verticalStripes: true,
      eyeAngle: Math.PI / 4,
    },
  ];

  spawnParticle(opts: ParticleOptions) {
    this.particles.createParticle(opts);
  }

  async setup() {
    sound.disableAutoPause = true;

    if (this.showDisplacement) {
      this.displacementSprite = new PIXI.Sprite(noiseTexture);
      this.displacementSprite.anchor.set(0.5);
      addChild(this.displacementSprite);

      engine.mainContainer.filters = [
        new PIXI.DisplacementFilter({
          sprite: this.displacementSprite,
        }),
      ];
    }

    camera.zoom = 10;
    camera.targetZoom = 10;

    globalThis.game = this;

    this.particles = new ParticleSystem(engine.app);

    this.particles.container.zIndex = -10;
    addChild(this.particles.container);

    this.player = new Player(this.startingLevel + 1, this.sizes);

    for (let i = 0; i < 20; i++) {
      if (!this.levelOptions[i]) continue;
      if (i - this.startingLevel < 5) {
        this.levelOptions[i].size = this.sizes[i];
        let level = new Level(i, this.levelOptions[i]);
        this.levels.push(level);
      } else {
        this.levels.push(null);
      }
    }

    // engine.paused = true;

    sound.add("music", { url: "./music/music1.mp3", loop: true, volume: 0.3 });
    sound.add("music2", { url: "./music/music2.mp3", loop: true, volume: 0.4 });
    sound.add("music3", { url: "./music/music3.mp3", loop: true, volume: 0.3 });

    sound.add("eat", { url: "./sounds/eat.mp3", volume: 0.1 });

    this.narrationManager = new NarrationManager(this.startingLevel + 1);

    const ui = document.getElementById("ui");

    this.xpUI = document.getElementById("xp") ?? undefined;

    engine.paused = true;
    // get play button (id:play)
    const playButton = document.getElementById("play");
    playButton?.addEventListener("click", () => {
      engine.paused = false;

      ui?.classList.add("opacity-0", "pointer-events-none");

      sound.play("music");
    });

    // engine.zoomContainer.filters = [
    //   new ShockwaveFilter({
    //     center: { x: 0, y: 0 },
    //   }),
    // ];

    // container.filters = [
    //   new AdvancedBloomFilter({
    //     threshold: 0.1,
    //     bloomScale: 0.8,
    //     quality: 10,
    //   }),
    // ];

    this.background = new Background();
  }

  gameOver() {
    let ui = document.getElementById("game-over");
    ui?.classList.remove("opacity-0", "pointer-events-none");

    setTimeout(() => {
      let text = document.getElementById("game-over-text");
      text?.classList.remove("opacity-0");
    }, 1500);

    this.narrationManager.gameOver();
  }

  update(dt, total) {
    if (this.displacementSprite) {
      this.displacementSprite.x =
        camera.x + (Math.sin(total / 1000) * 100) / camera.zoom;
      this.displacementSprite.y =
        camera.y + (Math.cos((total / 1000) * 1.5) * 100) / camera.zoom;

      this.displacementSprite.scale.set(10 / camera.zoom);
    }
    this.narrationManager.update(dt);

    this.background.update(dt, total, this.player);

    this.particles.update(dt);

    if (this.player.currentLevel > 3 && this.currentMusic === "music1") {
      sound.stop("music");
      sound.play("music2");

      this.currentMusic = "music2";
    }
    if (this.player.currentLevel > 6 && this.currentMusic === "music2") {
      sound.stop("music2");
      sound.play("music3");

      this.currentMusic = "music3";
    }

    if (this.player.currentLevel === 11 && !this.winScreenShown) {
      setTimeout(() => {
        let ui = document.getElementById("game-over");
        ui?.classList.remove("opacity-0", "pointer-events-none");

        setTimeout(() => {
          let text = document.getElementById("game-over-text");
          text?.classList.remove("opacity-0");
        }, 1500);
      }, 20000);
      this.winScreenShown = true;
    }

    if (this.player.organism.dead) {
      this.gameOver();
      return;
    }

    // engine.zoomContainer.filters[0].time += dt / 1000;
    for (let i = 0; i < this.levels.length; i++) {
      let level = this.levels[i];

      if (
        this.player.currentLevel - i >= -3 &&
        this.player.currentLevel - i < 0 &&
        !level &&
        i < this.levelOptions.length
      ) {
        this.levelOptions[i].size = this.sizes[i];
        let level = new Level(i, this.levelOptions[i]);
        this.levels[i] = level;
      }

      if (!level) continue;

      level.update(dt, total, this.player);

      if (
        Math.abs(this.player.currentLevel - i) < 2 &&
        level.container.filters &&
        Array.isArray(level.container.filters) &&
        level.container.filters.length > 0
      ) {
        // @ts-ignore
        level.container.filters = null;
      }

      if (this.player.currentLevel - i > 1) {
        level.removeLevel();
        this.levels[i] = null;
      }
      if (this.player.currentLevel - i === 1) {
        level.maxOrganisms = 20;
      }
      if (this.player.currentLevel - i === 0) {
        level.maxOrganisms = 5;
      }
      if (this.player.currentLevel - i === -1) {
        level.maxOrganisms = 10;
        level.speedModifier = 1;
        level.container.alpha = 1;
      }
      if (this.player.currentLevel - i === -2) {
        level.maxOrganisms = 3;

        level.speedModifier = 0.6;
        if (
          !level.container.filters ||
          (Array.isArray(level.container.filters) &&
            level.container.filters.length === 0)
        ) {
          level.container.filters = [
            new KawaseBlurFilter({ strength: 2, quality: 8 }),
          ];
        }

        level.container.alpha = 0.8;
      }
      if (this.player.currentLevel - i === -3) {
        level.maxOrganisms = 1;

        level.speedModifier = 0.3;
        if (
          !level.container.filters ||
          (Array.isArray(level.container.filters) &&
            level.container.filters.length === 0)
        ) {
          level.container.filters = [
            new KawaseBlurFilter({ strength: 4, quality: 8 }),
          ];
        }

        level.container.alpha = 0.5;
      }
    }

    this.player.update(dt, total);

    camera.targetX = this.player.x;
    camera.targetY = this.player.y;
  }
}

Engine.run(new Game());
