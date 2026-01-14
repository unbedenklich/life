import UberNoise from "../noise";
import * as PIXI from "pixi.js";

import { Collider, RigidBody, type Vector } from "@dimforge/rapier2d";

import {
  AdvancedBloomFilter,
  GlowFilter,
  KawaseBlurFilter,
} from "pixi-filters";

import * as colors from "@texel/color";
import { Organism, OrganismOptions } from "./Organism";
import { drawCurvedLineWithWaves } from "./helper";
import { VectorHelper } from "../Vector";

export type BlobOrganismOptions = OrganismOptions & {
  particleCount?: number;
  segments?: number;
  speed?: number;

  wiggle?: boolean;
};

export class BlobOrganism extends Organism {
  segments: number;

  noise: UberNoise;
  particleNoise: UberNoise;

  graphics = new PIXI.Graphics();

  particles: PIXI.Graphics[] = [];

  particleCount: number = 10;

  normalSpeed: number;

  wiggle: boolean = true;

  constructor(opts: BlobOrganismOptions) {
    super(opts);

    this.x = opts.x ?? 0;
    this.y = opts.y ?? 0;

    if (opts.minHue !== undefined && opts.maxHue !== undefined) {
      this.hue = opts.minHue + Math.random() * (opts.maxHue - opts.minHue);
    } else {
      this.hue = opts.hue ?? 0;
    }
    this.particleCount = opts.particleCount ?? 0;

    this.segments = opts.segments ?? 120;

    this.normalSpeed = this.speed;

    this.wiggle = opts.wiggle ?? true;

    this.noise = new UberNoise({ min: -0.1, max: 0.1, scale: 1 });
    this.particleNoise = new UberNoise({
      min: -Math.PI * 4,
      max: Math.PI * 4,
      scale: 0.005,
    });

    this.draw();
    this.container.addChild(this.graphics);

    for (let i = 0; i < this.particleCount; i++) {
      this.addParticle();
    }

    this.draw();

    this.addRigidBody();

    // this.container.filters = [
    //   new GlowFilter({
    //     distance: 40,
    //     outerStrength: 0,
    //     innerStrength: 5,
    //     color: colors.convert([0.2, 0.3, hue], colors.OKLCH, colors.sRGB),
    //     quality: 0.03,
    //     alpha: 0.2,
    //   }),
    //   new GlowFilter({
    //     distance: 50,
    //     outerStrength: 4,
    //     color: colors.convert([0.7, 0.3, hue], colors.OKLCH, colors.sRGB),
    //     quality: 0.03,
    //     alpha: 0.2,
    //   }),
    // ];
  }

  addParticle() {
    let hue = (this.hue + (Math.random() - 0.5) * this.particleCount * 5) % 360;
    let blob = new PIXI.Graphics();
    blob
      .circle(0, 0, this.size * 0.3 * Math.random())
      .fill({
        color: colors.convert([0.7, 0.3, hue], colors.OKLCH, colors.sRGB),
        alpha: 0.1 + Math.random() * 0.2,
      })
      .stroke({
        color: colors.convert([0.7, 0.3, hue], colors.OKLCH, colors.sRGB),
        width: 2,
        alpha: 0.3,
      });
    let angle = Math.random() * Math.PI * 2;
    let radius = Math.random() * this.size;
    blob.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius);
    this.container.addChild(blob);
    blob.alpha = 0;
    this.particles.push(blob);
  }

  update(dt, total, speedModifier = 1) {
    this.speed =
      this.normalSpeed * 0.8 +
      0.4 * this.normalSpeed * Math.abs(Math.cos(this.timer * 2));
    super.update(dt, total, speedModifier);

    this.draw();

    if (this.particleCount > this.particles.length) {
      this.addParticle();
    }

    if (Math.random() < 0.003 * dt) {
      this.spawnParticles(this.x, this.y, dt, this.direction, speedModifier);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let particle = this.particles[i];

      let angle = this.particleNoise.get(
        particle.x,
        particle.y,
        this.timer + i * 100
      );
      let speed = 0.02;
      particle.x += Math.cos(angle) * speed;
      particle.y += Math.sin(angle) * speed;

      let dist = Math.hypot(particle.x, particle.y);

      if (particle.alpha < 1) {
        particle.alpha += dt * 0.0003;
      }

      if (dist > this.size) {
        // remove particle
        this.container.removeChild(particle);
        this.particles.splice(i, 1);
      } else if (dist > this.size * 0.9) {
        // scale down
        let scale = (this.size - dist) / (this.size * 0.1);
        particle.scale.set(scale);
      }
    }
  }

  draw() {
    this.graphics.clear();

    for (let i = 0; i < this.segments; i++) {
      let angle = (i / this.segments) * Math.PI * 2;
      let x = Math.cos(angle);
      let y = Math.sin(angle);

      let r = this.size;

      if (this.wiggle) {
        r *= this.getScale(x, y, angle);
      }
      if (i === 0) {
        this.graphics.moveTo(x * r, y * r);
      } else {
        this.graphics.lineTo(x * r, y * r);
      }
    }

    this.graphics.closePath();
    this.graphics.fill(this.fillColor);
    this.graphics.stroke({
      color: this.strokeColor,
      width: this.strokeWidth,
    });

    // draw tail opposite of direction
    let angle = this.direction + Math.PI;
    let x = Math.cos(angle);
    let y = Math.sin(angle);

    let r = this.size;
    if (this.wiggle) {
      r *= this.getScale(x, y, angle);
    }
    let tailLength = this.size;

    this.graphics.moveTo(x * r, y * r);

    drawCurvedLineWithWaves(
      this.graphics,
      x * r,
      y * r,
      x * tailLength,
      y * tailLength,
      tailLength,
      this.size * 0.2,
      5
    );

    // if (
    //   this.closestEatable &&
    //   this.closestEatableDistance < this.size * this.huntingRange
    // ) {
    //   let angle = this.closestEatableAngle;
    //   let x = Math.cos(angle);
    //   let y = Math.sin(angle);

    //   let tailLength = this.size * this.huntingRange;

    //   this.graphics.moveTo(x * r, y * r);

    //   this.graphics.lineTo(x * tailLength, y * tailLength);
    // }

    this.graphics.stroke({
      color: this.strokeColor,
      width: this.strokeWidth,
    });
  }

  getScale(x: number, y: number, angle: number) {
    let diffPerpendicular = VectorHelper.relativeAngleDiff(
      angle,
      this.direction
    );
    let diffDirection = VectorHelper.relativeAngleDiff(
      angle,
      this.direction + Math.PI / 2
    );

    let scalePerpendicular =
      Math.abs(Math.abs(diffPerpendicular) - Math.PI / 2) * 0.3;
    let scaleDirection = Math.abs(Math.abs(diffDirection) - Math.PI / 2) * 0.3;

    let scale = 1 + this.noise.get(x, y, this.timer);

    let closestEatable = this.closestEatable;
    let closestEatableDistance = this.closestEatableDistance;
    let closestEatableAngle = this.closestEatableAngle;

    let scaleMultiplierLastEaten = 1;
    if (this.lastEatenTime < 1) {
      closestEatable = this.lastEaten;
      closestEatableDistance = this.lastEatenDistance;
      closestEatableAngle = this.lastEatenAngle;

      scaleMultiplierLastEaten = 1 - this.lastEatenTime;
    }

    if (
      closestEatable &&
      closestEatableDistance < this.size * this.huntingRange
    ) {
      let diffEatable = VectorHelper.relativeAngleDiff(
        angle,
        closestEatableAngle
      );
      let scaleEatable =
        Math.pow(Math.PI - Math.abs(diffEatable), 2) *
        (1 - closestEatableDistance / (this.size * this.huntingRange)) *
        0.1;

      scale =
        1 +
        this.noise.get(
          x * (1 + scaleEatable * 2 * scaleMultiplierLastEaten),
          y * (1 + scaleEatable * 2 * scaleMultiplierLastEaten),
          this.timer
        ) *
          (1 + scaleEatable * scaleMultiplierLastEaten);
      scale += scaleEatable * 0.4 * scaleMultiplierLastEaten;
    }

    scale *=
      ((1 + scaleDirection) * Math.abs(Math.cos(this.timer * 2)) +
        (1 + scalePerpendicular) * (1 - Math.abs(Math.cos(this.timer * 2)))) *
        0.5 +
      0.5;

    return scale * 0.7;
  }

  destroy(): void {
    for (let i = 0; i < 3; i++) {
      this.spawnParticles(this.x, this.y, 1, 0, 0);
    }
    super.destroy();
  }
}
