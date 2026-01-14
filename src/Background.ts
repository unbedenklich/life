import UberNoise from "./noise";
import { ParallaxLayer } from "./engine";
import * as colors from "@texel/color";

import * as PIXI from "pixi.js";
import { Player } from "./Player";

class BackgroundLayer {
  graphics: PIXI.Graphics;
  parallax: ParallaxLayer;

  circles: {
    x: number;
    y: number;
    size: number;
    color: number;
    currentAlpha: number;
    alpha: number;
    speed: number;
  }[] = [];

  maxCircles = 50;

  minHue: number = 200;
  maxHue: number = 250;

  minSize: number = 10;
  maxSize: number = 20;

  index: number;

  noise: UberNoise;

  constructor(opts: {
    index: number;
    minSize?: number;
    maxSize?: number;
    minHue?: number;
    maxHue?: number;
  }) {
    this.index = opts.index;

    this.minSize = opts.minSize ?? this.minSize;
    this.maxSize = opts.maxSize ?? this.maxSize;

    this.minHue = opts.minHue ?? this.minHue;
    this.maxHue = opts.maxHue ?? this.maxHue;

    this.parallax = newParallaxLayer(Math.pow(0.7, opts.index + 1));

    this.graphics = new PIXI.Graphics();

    this.parallax.addChild(this.graphics);

    // this.parallax.filters = [new PIXI.BlurFilter({ strength: 8 })];

    this.noise = new UberNoise({ max: Math.PI * 4, scale: 0.01 });

    this.update(0, 0);
  }

  update(dt: number, total: number, player?: Player) {
    while (this.circles.length < this.maxCircles) {
      this.addCircle(player);
    }

    this.graphics.clear();

    for (let i = this.circles.length - 1; i >= 0; i--) {
      let circle = this.circles[i];

      this.moveCircle(circle, dt);

      this.graphics
        .circle(circle.x, circle.y, circle.size)
        .fill({ color: circle.color, alpha: circle.currentAlpha });

      if (player) {
        let x = circle.x / this.parallax.xSpeed;
        let y = circle.y / this.parallax.ySpeed;
        let distance = Math.hypot(x - player.x, y - player.y);

        if (distance > 2000 / camera.zoom / this.parallax.xSpeed) {
          this.circles.splice(i, 1);
        }
      }

      if (Math.random() < 0.0001 * dt) {
        circle.alpha = 0;
      }

      if (circle.currentAlpha < 0.001 && circle.alpha < 0.001) {
        this.circles.splice(i, 1);
      }
    }
  }

  moveCircle(circle, dt: number) {
    let angle = this.noise.get(circle.x, circle.y);

    circle.x += Math.cos(angle) * circle.speed * dt;
    circle.y += Math.sin(angle) * circle.speed * dt;

    if (Math.abs(circle.currentAlpha - circle.alpha) > 0.001) {
      circle.currentAlpha +=
        dt * 0.0001 * Math.sign(circle.alpha - circle.currentAlpha);
    }
  }

  addCircle(player?: Player) {
    let x, y;
    if (player) {
      let angle = Math.random() * Math.PI * 2;
      let radius = Math.random() * 4000 + 0 + player.organism.size;

      radius /= camera.zoom;

      x = Math.cos(angle) * radius + player.x;
      y = Math.sin(angle) * radius + player.y;

      x *= this.parallax.xSpeed;
      y *= this.parallax.ySpeed;
    } else {
      x = (Math.random() - 0.5) * width * 4;
      y = (Math.random() - 0.5) * height * 4;
    }

    let size = this.minSize + Math.random() * (this.maxSize - this.minSize);
    size /= camera.zoom;
    let hue = (this.minHue + Math.random() * (this.maxHue - this.minHue)) % 360;
    let color = colors.convert(
      [Math.random(), 0.3, hue],
      colors.OKLCH,
      colors.sRGB
    );
    let alpha = 0.12 * Math.random() + 0.02;
    let speed = Math.random() * 0.002;
    this.circles.push({ x, y, size, color, alpha, speed, currentAlpha: 0 });
  }
}

export class Background {
  layers: BackgroundLayer[];

  constructor() {
    this.layers = [];

    for (let i = 0; i < 5; i++) {
      let size = Math.pow(1.6, 6 - i) * 2.5;

      let layer = new BackgroundLayer({
        index: i,
        minSize: size / 2,
        maxSize: size,
      });

      this.layers.push(layer);
    }
  }

  update(dt, total, player: Player) {
    this.layers.forEach((layer) => {
      layer.update(dt, total, player);
    });
  }
}
