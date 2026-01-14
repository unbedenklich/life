import { BlobOrganism } from "./organisms/Blob";
import { Organism } from "./organisms/Organism";
import { sound } from "@pixi/sound";
import { WormOrganism } from "./organisms/Worm";
import * as colors from "@texel/color";
import { FishOrganism } from "./organisms/Fish";

export class Player {
  currentLevel = 1;

  speed = 0.005;

  currentPoints = 0;

  percentagePoints = 0;

  // first level is ignored
  pointsNeeded = [-1, 10, 8, 8, 10, 14, 14, 16, 14, 16, 16];

  //pointsNeeded = [-1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

  organism: Organism;

  sizes: number[];

  cameraMultiplier = 0.55;

  upgrades: (() => void)[] = [
    () => {
      if (!(this.organism instanceof BlobOrganism)) return;

      this.organism.strokeColor = colors.convert(
        [0.7, 0.3, this.organism.hue],
        colors.OKLCH,
        colors.sRGB
      );

      this.organism.fillColor = colors.convert(
        [0.1, 0.1, this.organism.hue],
        colors.OKLCH,
        colors.sRGB
      );

      this.organism.strokeWidth = 0.8;
    },
    () => {
      let direction = this.organism.direction;
      let targetDirection = this.organism.targetDirection;
      let x = this.organism.x;
      let y = this.organism.y;

      this.organism.destroy();

      this.organism = new BlobOrganism({
        level: this.currentLevel,
        size: this.sizes[this.currentLevel],
        speed: 0.005,
        hue: 30,
        x: x,
        y: y,
        isPlayer: true,
        strokeWidth: 1.6,
        direction,
        targetDirection,
        particleCount: 10,
      });

      addChild(this.organism.container);
    },
    () => {
      let direction = this.organism.direction;
      let targetDirection = this.organism.targetDirection;
      let x = this.organism.x;
      let y = this.organism.y;

      this.organism.destroy();

      this.organism = new WormOrganism({
        level: this.currentLevel,
        size: this.sizes[this.currentLevel],
        speed: 0.005,
        hue: 60,
        x: x,
        y: y,
        isPlayer: true,
        strokeWidth: 3.2,
        direction,
        targetDirection,
      });

      addChild(this.organism.container);
    },
    () => {
      let direction = this.organism.direction;
      let targetDirection = this.organism.targetDirection;
      let x = this.organism.x;
      let y = this.organism.y;

      this.organism.destroy();

      this.organism = new WormOrganism({
        level: this.currentLevel,
        size: this.sizes[this.currentLevel],
        speed: 0.005,
        hue: 90,
        x: x,
        y: y,
        isPlayer: true,
        strokeWidth: 6.4,
        jointCount: 6,
        direction,
        targetDirection,
        hasEyes: true,
      });

      addChild(this.organism.container);
    },
    () => {
      let direction = this.organism.direction;
      let targetDirection = this.organism.targetDirection;
      let x = this.organism.x;
      let y = this.organism.y;

      this.organism.destroy();

      this.organism = new WormOrganism({
        level: this.currentLevel,
        size: this.sizes[this.currentLevel],
        speed: 0.005,
        hue: 120,
        x: x,
        y: y,
        isPlayer: true,
        strokeWidth: 12.8,
        jointCount: 9,
        direction,
        targetDirection,
        hasEyes: true,
      });

      addChild(this.organism.container);
    },
    () => {
      let direction = this.organism.direction;
      let targetDirection = this.organism.targetDirection;
      let x = this.organism.x;
      let y = this.organism.y;

      this.organism.destroy();

      this.organism = new FishOrganism({
        level: this.currentLevel,
        size: this.sizes[this.currentLevel],
        speed: 0.005,
        hue: 150,
        x: x,
        y: y,
        isPlayer: true,
        strokeWidth: 25.6,
        direction,
        targetDirection,
      });

      addChild(this.organism.container);
    },
    () => {
      let direction = this.organism.direction;
      let targetDirection = this.organism.targetDirection;
      let x = this.organism.x;
      let y = this.organism.y;

      this.organism.destroy();

      this.organism = new FishOrganism({
        level: this.currentLevel,
        size: this.sizes[this.currentLevel],
        speed: 0.005,
        hue: 180,
        x: x,
        y: y,
        thickness: 1.8,
        isPlayer: true,
        strokeWidth: 51.2,
        direction,
        targetDirection,
        showBackFins: true,
        points: true,
      });

      addChild(this.organism.container);
    },
    () => {
      let direction = this.organism.direction;
      let targetDirection = this.organism.targetDirection;
      let x = this.organism.x;
      let y = this.organism.y;

      this.organism.destroy();

      this.organism = new FishOrganism({
        level: this.currentLevel,
        size: this.sizes[this.currentLevel],
        speed: 0.005,
        hue: 210,
        x: x,
        y: y,
        thickness: 2.8,
        isPlayer: true,
        strokeWidth: 102.4,
        direction,
        targetDirection,
        showBackFins: true,
        verticalStripes: true,

        eyeAngle: Math.PI / 4,
      });

      addChild(this.organism.container);
    },
    () => {
      let direction = this.organism.direction;
      let targetDirection = this.organism.targetDirection;
      let x = this.organism.x;
      let y = this.organism.y;

      this.organism.destroy();

      this.organism = new FishOrganism({
        level: this.currentLevel,
        size: this.sizes[this.currentLevel],
        speed: 0.005,
        hue: 240,
        x: x,
        y: y,
        thickness: 2.5,
        isPlayer: true,
        strokeWidth: 204.8,
        eyeAngle: Math.PI / 4,
        eyeSize: 0.2,
        hasPupils: false,
        finScale: 0.3,
        roundTail: 0.5,
        direction,
        targetDirection,
        showBackFins: true,
        fillLightness: 0.2,
        fillChroma: 0.3,
        roundHead: 3,
        hasCaudalFin: false,
      });

      addChild(this.organism.container);
    },
    () => {},
  ];

  constructor(level: number, sizes: number[]) {
    this.currentLevel = level;

    this.sizes = sizes;

    this.organism = new BlobOrganism({
      level: this.currentLevel,
      isPlayer: true,
      size: sizes[this.currentLevel],
      strokeWidth: 0.4,
      strokeColor: 0xffffff,
      fillColor: 0,
      hue: 0,
      speed: 0.005,
    });
    addChild(this.organism.container);

    if (this.currentLevel > 1) {
      this.upgrades[this.currentLevel - 2]();
    }

    while (level > 1) {
      camera.zoom *= this.cameraMultiplier;
      camera.targetZoom *= this.cameraMultiplier;
      level--;
    }

    this.organism.container.zIndex = this.currentLevel;

    // pointer move event
    window.addEventListener("pointermove", (e) => {
      // always from center of screen
      this.organism.targetDirection =
        Math.atan2(
          e.clientX - window.innerWidth / 2,
          e.clientY - window.innerHeight / 2
        ) -
        Math.PI / 2;
    });

    window.addEventListener("pointerdown", (e) => {
      // always from center of screen
      this.organism.targetDirection =
        Math.atan2(
          e.clientX - window.innerWidth / 2,
          e.clientY - window.innerHeight / 2
        ) -
        Math.PI / 2;
    });
  }

  update(dt, total) {
    if (keys["a"]) {
      this.organism.targetDirection += this.organism.turnSpeed * dt;
    }
    if (keys["d"]) {
      this.organism.targetDirection -= this.organism.turnSpeed * dt;
    }

    if (this.organism.hunted) {
      game.narrationManager.isHunted = true;
    }

    if (this.organism.container.alpha < 1) {
      this.organism.container.alpha += dt / 2000;
    }

    this.organism.update(dt, total);

    let eat = this.organism.getClosestEatable();

    if (eat) {
      // get distance to eatable
      let dist = Math.hypot(eat.x - this.x, eat.y - this.y);

      // if distance is less than 50, eat it
      if (dist < this.organism.size * 1.5 - eat.size) {
        eat.dead = true;

        this.organism.lastEaten = eat;
        this.organism.lastEatenTime = 0;
        this.organism.lastEatenDistance = dist;
        this.organism.lastEatenAngle = Math.atan2(
          eat.y - this.y,
          eat.x - this.x
        );

        this.currentPoints++;

        this.percentagePoints =
          this.currentPoints / this.pointsNeeded[this.currentLevel];

        game.addXP(100 / this.pointsNeeded[this.currentLevel]);

        sound.play("eat");

        game.narrationManager.hasEaten = true;
      } else {
        this.organism.closestEatable = eat;
        this.organism.closestEatableDistance = dist;
        this.organism.closestEatableAngle = Math.atan2(
          eat.y - this.y,
          eat.x - this.x
        );
      }
    }

    if (this.currentPoints >= this.pointsNeeded[this.currentLevel]) {
      this.currentLevel++;
      this.organism.level = this.currentLevel;
      this.organism.container.zIndex = this.currentLevel;

      this.organism.updateCollisionGroup();
      this.currentPoints = 0;

      this.percentagePoints = 0;

      camera.targetZoom *= this.cameraMultiplier;

      this.organism.newSize = this.sizes[this.currentLevel];

      this.upgrades[this.currentLevel - 2]();

      this.organism.container.zIndex = this.currentLevel;
      game.resetXP();

      game.narrationManager.hasEvolved = true;
      game.narrationManager.currentLevel = this.currentLevel;

      this.organism.container.alpha = 0;
    }
  }

  get x() {
    return this.organism.x;
  }

  get y() {
    return this.organism.y;
  }
}
