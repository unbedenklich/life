import * as PIXI from "pixi.js";
import { Collider, RigidBody } from "@dimforge/rapier2d";
import UberNoise, { UberNoiseOptions } from "../noise";
import { VectorHelper } from "../Vector";
import * as colors from "@texel/color";
import { AdvancedBloomFilter } from "pixi-filters";

export type OrganismOptions = {
  level: number;
  isPlayer?: boolean;
  size?: number;
  speed?: number;
  moveNoiseOptions?: UberNoiseOptions;

  huntingRange?: number;

  x?: number;
  y?: number;

  hue?: number;
  minHue?: number;
  maxHue?: number;

  strokeColor?: PIXI.ColorSource;
  fillColor?: PIXI.ColorSource;

  fillLightness?: number;
  fillChroma?: number;

  fillAlpha?: number;

  strokeLightness?: number;
  strokeChroma?: number;
  strokeWidth?: number;

  direction?: number;
  targetDirection?: number;
};

export class Organism {
  dead: boolean = false;

  container: PIXI.Container;

  rigidBody: RigidBody;
  collider: Collider;

  collisionGroups: number;

  level: number;

  timer: number = 0;

  isPlayer: boolean;

  _size: number;

  moveNoise: UberNoise;

  speed: number;

  huntingRange: number;

  newSize: number;

  hunting: boolean = false;
  hunted: boolean = false;

  direction: number = 0;

  maxTurnSpeed: number = 0.02;

  hue: number;

  fillColor: PIXI.ColorSource;
  strokeColor: PIXI.ColorSource;

  strokeWidth: number;

  fillAlpha: number;

  turnSpeed: number = 0.002;
  targetDirection: number = 0;

  closestEatable: Organism | undefined = undefined;
  closestEatableDistance: number = 0;
  closestEatableAngle: number = 0;

  closestEnemy: Organism | undefined = undefined;
  closestEnemyDistance: number = 0;
  closestEnemyAngle: number = 0;

  lastEaten: Organism | undefined = undefined;
  lastEatenTime: number = 0;
  lastEatenDistance: number = 0;
  lastEatenAngle: number = 0;

  constructor(opts: OrganismOptions) {
    this.container = new PIXI.Container();

    this.isPlayer = opts.isPlayer ?? false;
    this.level = opts.level ?? 0;

    this.size = opts.size ?? 10;
    this.newSize = this.size;

    this.speed = opts.speed ?? 0.002;

    this.direction = opts.direction ?? this.direction;
    this.targetDirection = opts.targetDirection ?? this.direction;

    this.collisionGroups = ((1 << this.level % 16) << 16) | 0x0000ffff;

    if (opts.minHue !== undefined && opts.maxHue !== undefined) {
      this.hue = opts.minHue + Math.random() * (opts.maxHue - opts.minHue);
    } else {
      this.hue = opts.hue ?? 0;
    }
    this.strokeWidth = opts.strokeWidth ?? 2;

    this.fillAlpha = opts.fillAlpha ?? 1;

    if (opts.fillColor !== undefined) {
      this.fillColor = opts.fillColor;
    } else {
      this.fillColor = colors.convert(
        [opts.fillLightness ?? 0.1, opts.fillChroma ?? 0.1, this.hue],
        colors.OKLCH,
        colors.sRGB
      );
    }

    if (opts.strokeColor !== undefined) {
      this.strokeColor = opts.strokeColor;
    } else {
      this.strokeColor = colors.convert(
        [opts.strokeLightness ?? 0.7, opts.strokeChroma ?? 0.3, this.hue],
        colors.OKLCH,
        colors.sRGB
      );
    }

    this.moveNoise = new UberNoise(
      opts.moveNoiseOptions ?? {
        min: -0.01,
        max: 0.01,
        scale: 0.5 / this.size,
      }
    );

    this.huntingRange = opts.huntingRange ?? 5;

    // if (this.isPlayer) {
    //   this.container.filters = [
    //     new AdvancedBloomFilter({
    //       threshold: 0.2,
    //       bloomScale: 2,
    //       blur: 5,
    //       quality: 5,
    //     }),
    //   ];
    // }
  }

  addRigidBody() {
    const rigidBodyDesc =
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
        this.x,
        this.y
      );
    this.rigidBody = physicsWorld.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.ball(this.size)
      .setCollisionGroups(this.collisionGroups)
      .setSensor(true)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

    this.collider = physicsWorld.createCollider(colliderDesc, this.rigidBody);

    this.rigidBody.userData = this;
  }

  getClosestEatable() {
    if (this.level < 1) return;

    let eatableCollisionGroup = 0xffff0000 | (1 << (this.level - 1) % 16);

    let proj = physicsWorld.projectPoint(
      { x: this.x, y: this.y },
      false,
      undefined,
      eatableCollisionGroup
    );

    if (proj) {
      let eatable = proj.collider.parent()?.userData as Organism;
      if (Math.abs(eatable.level - this.level) !== 1) {
        console.error("not eatable");
        console.log(eatable.level, this.level);
      }

      return eatable;
    }
  }

  update(dt: number, total: number, speedModifier: number = 1) {
    if (this.dead) return;

    this.timer += dt * 0.001;

    this.lastEatenTime += dt * 0.001;

    if (this.newSize > this.size) {
      this.size += dt * 0.1;
    }

    this.hunted = false;

    this.move(dt, speedModifier);
  }

  updateCollisionGroup() {
    this.collisionGroups = ((1 << this.level % 16) << 16) | 0x0000ffff;
    this.collider.setCollisionGroups(this.collisionGroups);
  }

  spawnParticles(
    startX: number,
    startY: number,
    dt: number,
    direction: number,
    speedModifier: number = 1
  ) {
    let angle = Math.random() * Math.PI * 2;

    let x = Math.cos(angle) * this.size * 0.5;
    let y = Math.sin(angle) * this.size * 0.5;

    let speedX =
      -Math.cos(direction) * this.speed * 0.05 * this.size * dt * speedModifier;
    let speedY =
      -Math.sin(direction) * this.speed * 0.05 * this.size * dt * speedModifier;

    game.spawnParticle({
      x: startX + x,
      y: startY + y,
      size: this.size * Math.random() * 0.6,
      color: this.strokeColor,
      alpha: 0.1,
      speedX,
      speedY,
      maxAge: 500 + Math.random() * 1500,
    });
  }

  move(dt: number, speedModifier: number = 1) {
    this.x +=
      Math.cos(this.direction) * this.speed * dt * this.size * speedModifier;
    this.y +=
      Math.sin(this.direction) * this.speed * dt * this.size * speedModifier;

    let diff = VectorHelper.relativeAngleDiff(
      this.direction,
      this.targetDirection
    );
    if (Math.abs(diff) > dt * this.turnSpeed) {
      this.turn(dt * this.turnSpeed * Math.sign(diff));
    }

    if (this.isPlayer) return;

    let eat = this.getClosestEatable();

    this.hunting = false;
    if (eat) {
      // get distance to eatable
      let dist = Math.hypot(eat.x - this.x, eat.y - this.y);

      // if distance is less than 50, eat it
      if (dist < this.size - eat.size) {
        // console.log("eating");
        eat.dead = true;

        this.closestEatable = undefined;

        this.lastEaten = eat;
        this.lastEatenTime = 0;
        this.lastEatenDistance = dist;
        this.lastEatenAngle = Math.atan2(eat.y - this.y, eat.x - this.x);
        return;
      }

      if (dist < this.huntingRange * this.size) {
        let angle = Math.atan2(eat.y - this.y, eat.x - this.x);

        this.closestEatable = eat;
        this.closestEatableDistance = dist;
        this.closestEatableAngle = angle;

        this.targetDirection = angle;
        // let diff = VectorHelper.relativeAngleDiff(this.direction, angle);
        // if (Math.abs(diff) > 0.01) {
        //   this.turn(dt * 0.005 * Math.sign(diff));
        // }

        this.hunting = true;

        eat.hunted = true;
        return;
      } else {
        this.closestEatable = undefined;
      }
    } else {
      this.closestEatable = undefined;
    }

    let angle =
      this.moveNoise.get(this.x, this.y, this.timer) +
      Math.sin(this.timer) * 0.0005 * dt;

    this.targetDirection += angle;
  }

  turn(angle: number): void {
    this.direction += angle;
  }

  get x() {
    if (!this.rigidBody) return this.container.x;
    return this.rigidBody.translation().x;
  }
  set x(value) {
    this.container.x = value;

    if (this.rigidBody) {
      this.rigidBody.setTranslation({ x: value, y: this.y }, true);
    }
  }
  get y() {
    if (!this.rigidBody) return this.container.y;
    return this.rigidBody.translation().y;
  }
  set y(value) {
    this.container.y = value;

    if (this.rigidBody) {
      this.rigidBody.setTranslation({ x: this.x, y: value }, true);
    }
  }

  set size(value: number) {
    this._size = value;
  }
  get size() {
    return this._size;
  }

  destroy() {
    this.dead = true;

    this.container.destroy({ children: true });

    if (this.rigidBody) physicsWorld.removeRigidBody(this.rigidBody);
  }
}
