import { VectorHelper } from "../Vector";
import * as PIXI from "pixi.js";

import * as colors from "@texel/color";
import { GlowFilter } from "pixi-filters";
import { Body } from "../base/Body";
import { Organism, OrganismOptions } from "./Organism";

type FishOrganismOptions = OrganismOptions & {
  finColor?: PIXI.ColorSource;
  finAlpha?: number;

  showBackFins?: boolean;

  hasPupils?: boolean;

  thickness?: number;

  points?: boolean;
  horizontalStripes?: boolean;
  verticalStripes?: boolean;

  eyeAngle?: number;
  eyeSize?: number;

  roundHead?: number;

  finScale?: number;

  roundTail?: number;

  hasCaudalFin?: boolean;
};

export class FishOrganism extends Organism {
  finColor: PIXI.ColorSource;
  finAlpha: number = 0.7;

  eyeSize: number = 0.4;

  eyeColor: PIXI.ColorSource;

  eyeAngle: number = Math.PI / 2;

  bodyWidth: number[];

  container: PIXI.Container;

  body: Body;
  bodyGraphics: PIXI.Graphics;

  leftFrontFin: PIXI.Graphics;
  rightFrontFin: PIXI.Graphics;

  leftBackFin: PIXI.Graphics;
  rightBackFin: PIXI.Graphics;

  showBackFins: boolean = false;

  finScale?: number;

  hasCaudalFin: boolean = true;

  hasPupils: boolean = true;

  thickness: number = 1;

  position: PIXI.Point = new PIXI.Point(0, 0);

  points: boolean = false;
  horizontalStripes: boolean = false;
  verticalStripes: boolean = false;

  constructor(opts: FishOrganismOptions) {
    super(opts);

    this.finColor = colors.convert(
      [0.8, 0.2, this.hue],
      colors.OKLCH,
      colors.sRGB
    );

    this.points = opts.points ?? false;
    this.horizontalStripes = opts.horizontalStripes ?? false;
    this.verticalStripes = opts.verticalStripes ?? false;

    this.eyeColor = 0xffffff;

    this.bodyWidth = [
      68 / 84,
      81 / 84,
      1,
      83 / 84,
      77 / 84,
      64 / 84,
      51 / 84,
      38 / 84,
      32 / 84,
      19 / 84,
    ];

    this.thickness = opts.thickness ?? 1;

    for (let i = 0; i < this.bodyWidth.length; i++) {
      this.bodyWidth[i] *= this.size;
    }

    this.position = new PIXI.Point(opts.x, opts.y);

    this.body = new Body({
      origin: new PIXI.Point(opts.x, opts.y),
      jointCount: 12,
      linkSize: ((64 / 84) * this.size) / Math.pow(this.thickness, 0.8),
      angleConstraint: Math.PI / 8,
      bodyWidth: this.bodyWidth,
      roundHead: (this.size / 2) * (opts.roundHead ?? 1),
      roundTail: this.size * (opts.roundTail ?? 0),
    });

    this.eyeSize = opts.eyeSize ?? this.eyeSize;

    this.container = new PIXI.Container();
    this.bodyGraphics = new PIXI.Graphics();

    this.showBackFins = opts.showBackFins ?? false;

    this.finScale = opts.finScale ?? 0.5;

    this.hasCaudalFin = opts.hasCaudalFin ?? true;

    this.eyeAngle = opts.eyeAngle ?? this.eyeAngle;

    this.hasPupils = opts.hasPupils ?? true;
    // this.bodyGraphics.filters = [
    //   new GlowFilter({
    //     distance: 40,
    //     outerStrength: 5,
    //     innerStrength: 0,
    //     color: 0,
    //     quality: 0.1,
    //     alpha: 0.5,
    //   }),
    // ];

    this.addFins();
    this.container.addChild(this.bodyGraphics);

    this.draw();

    this.addRigidBody();
  }

  addFins() {
    this.leftFrontFin = new PIXI.Graphics();
    this.leftFrontFin.visible = false;
    this.container.addChild(this.leftFrontFin);

    let finScale = this.size * (this.finScale ?? 0.5);

    this.leftFrontFin
      .ellipse(0, 0, (160 / 84) * finScale, (64 / 84) * finScale)
      .fill({ color: this.finColor, alpha: this.finAlpha });

    this.rightFrontFin = new PIXI.Graphics();
    this.rightFrontFin.visible = false;
    this.container.addChild(this.rightFrontFin);

    this.rightFrontFin
      .ellipse(0, 0, (160 / 84) * finScale, (64 / 84) * finScale)
      .fill({ color: this.finColor, alpha: this.finAlpha });

    this.leftBackFin = new PIXI.Graphics();
    this.leftBackFin.visible = false;
    this.container.addChild(this.leftBackFin);

    this.leftBackFin
      .ellipse(0, 0, (96 / 84) * finScale, (32 / 84) * finScale)
      .fill({ color: this.finColor, alpha: this.finAlpha });

    this.rightBackFin = new PIXI.Graphics();
    this.rightBackFin.visible = false;
    this.container.addChild(this.rightBackFin);

    this.rightBackFin
      .ellipse(0, 0, (96 / 84) * finScale, (32 / 84) * finScale)
      .fill({ color: this.finColor, alpha: this.finAlpha });
  }

  update(dt: number, total: number, speedModifier: number = 1): void {
    super.update(dt, total, speedModifier);
    this.draw();

    // if (!this.isPlayer)
    if (Math.random() < 0.003 * dt) {
      let lastJoint = this.body.spine.joints[9];
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

    if (this.showBackFins) {
      this.leftBackFin.visible = true;
      this.rightBackFin.visible = true;
    }
    this.leftFrontFin.visible = true;
    this.rightFrontFin.visible = true;

    const spineJoints = this.body.spine.joints;
    const spineAngles = this.body.spine.angles;

    const headToMid1 = VectorHelper.relativeAngleDiff(
      spineAngles[0],
      spineAngles[6]
    );
    const headToMid2 = VectorHelper.relativeAngleDiff(
      spineAngles[0],
      spineAngles[7]
    );
    const headToTail =
      headToMid1 +
      VectorHelper.relativeAngleDiff(spineAngles[6], spineAngles[11]);

    // === START PECTORAL FINS ===
    this.leftFrontFin.position.set(
      this.body.getPosX(3, Math.PI / 3, 0),
      this.body.getPosY(3, Math.PI / 3, 0)
    );
    this.leftFrontFin.rotation = spineAngles[2] - Math.PI / 4;

    this.rightFrontFin.position.set(
      this.body.getPosX(3, -Math.PI / 3, 0),
      this.body.getPosY(3, -Math.PI / 3, 0)
    );
    this.rightFrontFin.rotation = spineAngles[2] + Math.PI / 4;
    // === END PECTORAL FINS ===

    // === START VENTRAL FINS ===
    this.leftBackFin.position.set(
      this.body.getPosX(7, Math.PI / 2, 0),
      this.body.getPosY(7, Math.PI / 2, 0)
    );
    this.leftBackFin.rotation = spineAngles[6] - Math.PI / 4;
    this.rightBackFin.position.set(
      this.body.getPosX(7, -Math.PI / 2, 0),
      this.body.getPosY(7, -Math.PI / 2, 0)
    );
    this.rightBackFin.rotation = spineAngles[6] + Math.PI / 4;
    // === END VENTRAL FINS ===

    // === START CAUDAL FINS ===
    if (this.hasCaudalFin)
      this.drawCaudalFin(
        this.bodyGraphics,
        spineJoints,
        spineAngles,
        headToTail
      );
    // === END CAUDAL FINS ===

    // === START BODY ===
    this.body.drawBody(this.bodyGraphics, 9);
    this.bodyGraphics.fill(this.fillColor);
    this.bodyGraphics.stroke({
      color: this.strokeColor,
      width: this.strokeWidth,
    });
    // === END BODY ===

    // === START DORSAL FIN ===
    this.bodyGraphics.moveTo(spineJoints[4].x, spineJoints[4].y);
    this.bodyGraphics.bezierCurveTo(
      spineJoints[5].x,
      spineJoints[5].y,
      spineJoints[6].x,
      spineJoints[6].y,
      spineJoints[7].x,
      spineJoints[7].y
    );
    this.bodyGraphics.bezierCurveTo(
      spineJoints[6].x +
        Math.cos(spineAngles[6] + Math.PI / 2) * headToMid2 * 16,
      spineJoints[6].y +
        Math.sin(spineAngles[6] + Math.PI / 2) * headToMid2 * 16,
      spineJoints[5].x +
        Math.cos(spineAngles[5] + Math.PI / 2) * headToMid1 * 16,
      spineJoints[5].y +
        Math.sin(spineAngles[5] + Math.PI / 2) * headToMid1 * 16,
      spineJoints[4].x,
      spineJoints[4].y
    );
    this.bodyGraphics.fill(this.finColor);
    // === END DORSAL FIN ===

    // draw stripes

    if (this.horizontalStripes) {
      let x = this.body.getPosX(0, Math.PI, 0);
      let y = this.body.getPosY(0, Math.PI, 0);

      for (let i = 1; i < 9; i++) {
        let x1 = this.body.getPosX(i, Math.PI / 2, 0);
        let y1 = this.body.getPosY(i, Math.PI / 2, 0);

        let x2 = this.body.getPosX(9 - i, -Math.PI / 2, 0);
        let y2 = this.body.getPosY(9 - i, -Math.PI / 2, 0);

        this.bodyGraphics.moveTo(x1, y1);

        let cx = this.body.getPosX(8, 0, 0);
        let cy = this.body.getPosY(8, 0, 0);

        this.bodyGraphics.quadraticCurveTo(cx, cy, x2, y2);

        x1 = this.body.getPosX(i, -Math.PI / 2, 0);
        y1 = this.body.getPosY(i, -Math.PI / 2, 0);

        x2 = this.body.getPosX(9 - i, Math.PI / 2, 0);
        y2 = this.body.getPosY(9 - i, Math.PI / 2, 0);

        this.bodyGraphics.moveTo(x1, y1);

        cx = this.body.getPosX(8, 0, 0);
        cy = this.body.getPosY(8, 0, 0);

        this.bodyGraphics.quadraticCurveTo(cx, cy, x2, y2);
      }

      this.bodyGraphics.stroke({
        color: this.strokeColor,
        width: this.strokeWidth * (this.isPlayer ? 0.4 : 1),
        alpha: 0.5,
      });
    }

    if (this.verticalStripes) {
      for (let i = 1; i < 8; i++) {
        let x1 = this.body.getPosX(i, Math.PI / 2, 0);
        let y1 = this.body.getPosY(i, Math.PI / 2, 0);

        let x2 = this.body.getPosX(i + 1, -Math.PI / 2, 0);
        let y2 = this.body.getPosY(i + 1, -Math.PI / 2, 0);

        let cx = this.body.getPosX(i + 2, 0, 0);
        let cy = this.body.getPosY(i + 2, 0, 0);

        this.bodyGraphics.moveTo(x1, y1);
        this.bodyGraphics.quadraticCurveTo(cx, cy, x2, y2);

        x1 = this.body.getPosX(i + 1, Math.PI / 2, 0);
        y1 = this.body.getPosY(i + 1, Math.PI / 2, 0);

        x2 = this.body.getPosX(i, -Math.PI / 2, 0);
        y2 = this.body.getPosY(i, -Math.PI / 2, 0);

        cx = this.body.getPosX(i + 2, 0, 0);
        cy = this.body.getPosY(i + 2, 0, 0);

        this.bodyGraphics.moveTo(x1, y1);
        this.bodyGraphics.quadraticCurveTo(cx, cy, x2, y2);
      }

      this.bodyGraphics.stroke({
        color: this.strokeColor,
        width: this.strokeWidth * (this.isPlayer ? 0.5 : 1),
        alpha: 0.5,
      });
    }

    if (this.points) {
      let offsets = [-0.8, 0.6, -0.3, 0.5, -0.3, -0.1, 0.1, -0.1, 0.1, -0.1];
      let sizes = [0.2, 0.2, 0.4, 0.3, 0.3, 0.1, 0.2, 0.1, 0.1, 0.1];
      for (let i = 0; i < 9; i += 1) {
        let x = this.body.getPosX(i, offsets[i] * 0.5 + Math.PI, 0);
        let y = this.body.getPosY(i, offsets[i] * 0.5 + Math.PI, 0);
        this.bodyGraphics.circle(x, y, this.size * sizes[i]);
      }
      this.bodyGraphics.fill({ color: this.strokeColor, alpha: 0.5 });
      // this.bodyGraphics.stroke({
      //   color: this.strokeColor,
      //   width: this.strokeWidth * 0.2,
      // });
    }

    // === START EYES ===
    this.body.drawEye(
      this.bodyGraphics,
      0,
      this.eyeAngle,
      -this.size * 0.2,
      this.size * this.eyeSize,
      0xffffff,
      this.hasPupils
    );
    this.body.drawEye(
      this.bodyGraphics,
      0,
      -this.eyeAngle,
      -this.size * 0.2,
      this.size * this.eyeSize,
      0xffffff,
      this.hasPupils
    );

    this.bodyGraphics.fill(0xffffff);
    // === END EYES ===

    //this.body.spine.display(this.bodyGraphics, this.bodyWidth);
  }

  private drawCaudalFin(
    graphics: PIXI.Graphics,
    spineJoints: PIXI.Point[],
    spineAngles: number[],
    headToTail: number
  ): void {
    graphics.moveTo(
      spineJoints[8].x +
        Math.cos(spineAngles[8] - Math.PI / 2) * 1.5 * headToTail * 0,
      spineJoints[8].y +
        Math.sin(spineAngles[8] - Math.PI / 2) * 1.5 * headToTail * 0
    );
    for (let i = 8; i < 12; i++) {
      const tailWidth =
        ((1.5 * headToTail * (i - 8) * (i - 8)) / 80) * this.size;
      graphics.lineTo(
        spineJoints[i].x + Math.cos(spineAngles[i] - Math.PI / 2) * tailWidth,
        spineJoints[i].y + Math.sin(spineAngles[i] - Math.PI / 2) * tailWidth
      );
    }

    for (let i = 11; i >= 8; i--) {
      const tailWidth =
        (Math.max(-13, Math.min(13, headToTail * 6)) / 80) * this.size;
      graphics.lineTo(
        spineJoints[i].x + Math.cos(spineAngles[i] + Math.PI / 2) * tailWidth,
        spineJoints[i].y + Math.sin(spineAngles[i] + Math.PI / 2) * tailWidth
      );
    }

    graphics.closePath();
    graphics.fill(this.finColor);
  }

  set size(value: number) {
    if (this.body) {
      let lastValue = this._size;

      let percentageChange = value / lastValue;
      for (let i = 0; i < this.body.bodyWidth.length; i++) {
        this.body.bodyWidth[i] *= percentageChange;
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
}
