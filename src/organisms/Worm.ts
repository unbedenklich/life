import { Body } from "../base/Body";

import * as PIXI from "pixi.js";
import * as colors from "@texel/color";
import { Organism, OrganismOptions } from "./Organism";
import { drawCurvedLineWithWaves } from "./helper";
import { VectorHelper } from "../Vector";

export type WormOrganismOptions = OrganismOptions & {
  eyeColor?: PIXI.ColorSource;

  jointCount?: number;

  hasEyes?: boolean;
};

export class WormOrganism extends Organism {
  eyeColor: PIXI.ColorSource;

  hasEyes: boolean = false;
  eyeSize: number = 0.4;

  body: Body;
  bodyGraphics: PIXI.Graphics;

  hue: number;

  position: PIXI.Point = new PIXI.Point(0, 0);

  constructor(opts: WormOrganismOptions) {
    super(opts);

    if (opts.eyeColor) this.eyeColor = opts.eyeColor;
    else {
      this.eyeColor = colors.convert(
        [1, 0.1, this.hue],
        colors.OKLCH,
        colors.sRGB
      );
    }

    this.eyeSize = 0.3;

    let bodyWidth: number[] = [];
    let jointCount = opts.jointCount ?? 3;

    for (let i = 0; i < jointCount; i++) {
      let size = this.size;
      if (this.level > 5) {
        size *= Math.pow(0.8, i);
      }
      bodyWidth.push(size * 0.8);
    }

    this.hasEyes = opts.hasEyes ?? false;

    this.position = new PIXI.Point(opts.x, opts.y);

    this.body = new Body({
      origin: new PIXI.Point(opts.x, opts.y),
      jointCount: jointCount,
      linkSize: this.size / 2,
      angleConstraint: Math.PI / 8,
      bodyWidth: bodyWidth,
      roundTail: this.level > 5 ? 0 : this.size / 4,
      roundHead: this.size / 2,
    });

    this.bodyGraphics = new PIXI.Graphics();

    this.container.addChild(this.bodyGraphics);

    this.draw();

    this.addRigidBody();
  }

  update(dt: number, total: number, speedModifier: number = 1): void {
    super.update(dt, total, speedModifier);
    this.draw();

    if (Math.random() < 0.003 * dt) {
      let lastJoint = this.body.spine.joints[this.body.spine.joints.length - 1];
      let x = lastJoint.x;
      let y = lastJoint.y;

      this.spawnParticles(x, y, dt, this.direction, speedModifier);
    }

    this.resolve(dt);
  }

  resolve(dt: number): void {
    if (this.position && this.body) {
      // get distance between postition and head
      let dist = Math.hypot(
        this.position.x - this.body.x,
        this.position.y - this.body.y
      );

      if (dist < 0.1) return;

      this.body.moveTo(this.position);
    }
  }

  get x() {
    return this.position.x;
  }
  set x(value) {
    this.position.x = value;
    if (this.rigidBody)
      this.rigidBody.setTranslation({ x: value, y: this.y }, true);

    this.container.x = 0;
  }
  get y() {
    return this.position.y;
  }
  set y(value) {
    this.position.y = value;
    if (this.rigidBody)
      this.rigidBody.setTranslation({ x: this.x, y: value }, true);

    this.container.y = 0;
  }

  draw(): void {
    this.bodyGraphics.clear();

    // === START BODY ===
    let points = this.body.drawBody(this.bodyGraphics);
    this.bodyGraphics.fill({ color: this.fillColor, alpha: this.fillAlpha });
    this.bodyGraphics.stroke({
      color: this.strokeColor,
      width: this.strokeWidth,
    });

    // === END BODY ===

    if (showingDebug) {
      for (let i = 8; points && i < points.length; i += 4) {
        this.bodyGraphics
          .circle(points[i], points[i + 1], 4)
          .fill({ color: 0xff0000 });
        this.bodyGraphics
          .circle(points[i + 2], points[i + 3], 4)
          .fill({ color: 0x00ff00 });
      }
      //this.body.spine.display(this.bodyGraphics, this.bodyWidth);
    }

    if (this.hasEyes) {
      this.body.drawEye(
        this.bodyGraphics,
        0,
        Math.PI / 2,
        -this.size * 0.3,
        this.size * this.eyeSize,
        this.eyeColor,
        this.level > 5
      );
      this.body.drawEye(
        this.bodyGraphics,
        0,
        -Math.PI / 2,
        -this.size * 0.3,
        this.size * this.eyeSize,
        this.eyeColor,
        this.level > 5
      );
    }
    // draw tail

    let spineAngles = this.body.spine.angles;
    let angle =
      VectorHelper.relativeAngleDiff(
        spineAngles[spineAngles.length - 3],
        spineAngles[spineAngles.length - 1]
      ) +
      spineAngles[spineAngles.length - 1] +
      Math.PI;
    let x = this.body.getPosX(spineAngles.length - 1, Math.PI, 0);
    let y = this.body.getPosY(spineAngles.length - 1, Math.PI, 0);

    let tailLength = this.size;

    let dx = Math.cos(angle);
    let dy = Math.sin(angle);

    this.bodyGraphics.moveTo(x, y);

    drawCurvedLineWithWaves(
      this.bodyGraphics,
      x,
      y,
      dx * tailLength,
      dy * tailLength,
      tailLength,
      this.size * 0.2,
      5
    );

    this.bodyGraphics.stroke({
      color: this.strokeColor,
      width: this.strokeWidth,
    });
  }

  set size(value: number) {
    if (this.body) {
      for (let i = 0; i < this.body.bodyWidth.length; i++) {
        let size = value;

        if (this.level > 5) {
          size *= Math.pow(0.8, i);
        }
        this.body.bodyWidth[i] = size * 0.8;
      }
    }
    this._size = value;
  }

  get size(): number {
    return this._size;
  }

  destroy(): void {
    for (let i = 0; i < this.body.spine.joints.length; i++) {
      let joint = this.body.spine.joints[i];
      this.spawnParticles(joint.x, joint.y, 1, 0, 0);
    }

    super.destroy();
  }

  popTail() {
    this.body.spine.joints.pop();
    this.body.spine.angles.pop();
  }
}
