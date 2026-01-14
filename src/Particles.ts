import UberNoise from "./noise";
import * as PIXI from "pixi.js";

interface ParticleSprite extends PIXI.Sprite {
  speedX: number;
  speedY: number;
  age: number;
  maxAge: number;
  initialAlpha: number;
  initialScale: number;
}

export type ParticleOptions = {
  x?: number;
  y?: number;
  size?: number;
  color?: PIXI.ColorSource;
  alpha?: number;
  speedX?: number;
  speedY?: number;
  maxAge?: number;
};

export default class ParticleSystem {
  private app: PIXI.Application;
  private maxParticles: number;
  public container: PIXI.Container;
  private particles: ParticleSprite[];
  private particlePool: ParticleSprite[];
  private baseGraphics: PIXI.Graphics;
  private baseTexture: PIXI.Texture;

  noise: UberNoise;

  constructor(app: PIXI.Application, maxParticles: number = 5000) {
    this.app = app;
    this.maxParticles = maxParticles;
    this.container = new PIXI.Container();
    this.container.zIndex = 10;
    this.particles = [];
    this.particlePool = [];
    this.baseGraphics = new PIXI.Graphics();
    this.baseGraphics.circle(0, 0, 40).fill(0xffffff);
    this.baseTexture = this.app.renderer.generateTexture(this.baseGraphics);

    this.noise = new UberNoise({ scale: 0.1 });
  }

  createParticle(opts?: ParticleOptions): ParticleSprite | null {
    opts = opts ?? {};
    let particle: ParticleSprite;
    if (this.particlePool.length > 0) {
      particle = this.particlePool.pop()!;
    } else if (this.particles.length < this.maxParticles) {
      particle = new PIXI.Sprite(this.baseTexture) as ParticleSprite;
      particle.anchor.set(0.5);
    } else {
      return null;
    }

    particle.x = opts.x ?? 0;
    particle.y = opts.y ?? 0;
    particle.scale = (opts.size ?? 1) / 40;
    particle.initialScale = (opts.size ?? 1) / 40;
    particle.tint = opts.color ?? 0xffffff;
    particle.alpha = opts.alpha ?? 1;
    particle.speedX = opts.speedX ?? 0;
    particle.speedY = opts.speedY ?? 0;
    particle.age = 0;
    particle.maxAge = opts.maxAge ?? 1000;
    particle.initialAlpha = particle.alpha ?? 1;

    this.container.addChild(particle);
    this.particles.push(particle);

    return particle;
  }

  removeParticle(particle: ParticleSprite): void {
    const index = this.particles.indexOf(particle);
    if (index !== -1) {
      this.particles.splice(index, 1);
      this.container.removeChild(particle);
      this.particlePool.push(particle);
    }
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.speedX * deltaTime;
      particle.y += particle.speedY * deltaTime;
      particle.age += deltaTime;

      // Shrink the particle
      const lifeRatio = (1 - particle.age / particle.maxAge) * 0.5 + 0.5;
      particle.scale = particle.initialScale * lifeRatio;
      particle.alpha = particle.initialAlpha * lifeRatio;

      // Remove particle if it's too old or off-screen
      if (particle.age >= particle.maxAge) {
        this.removeParticle(particle);
      }
    }
  }
}
