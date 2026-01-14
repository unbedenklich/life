import { VectorHelper } from "../Vector";
import { Chain } from "./Chain";

import * as PIXI from "pixi.js";

export class Body {
  bodyWidth: number[];
  spine: Chain;

  drawCircles: boolean = false;

  roundTail: number;
  roundHead: number;

  constructor(opts: {
    origin: PIXI.Point;
    jointCount: number;
    linkSize: number;
    angleConstraint?: number;
    bodyWidth?: number[];
    roundTail?: number;
    roundHead?: number;
  }) {
    this.spine = new Chain(
      opts.origin,
      opts.jointCount,
      opts.linkSize,
      opts.angleConstraint ?? Math.PI * 2
    );
    this.bodyWidth = opts.bodyWidth ?? [];

    this.roundTail = opts.roundTail ?? 0;
    this.roundHead = opts.roundHead ?? 30;
  }

  moveTowards(pos: PIXI.Point, speed: number): void {
    const headPos = this.spine.joints[0];
    const targetPos = VectorHelper.addVectors(
      headPos,
      VectorHelper.normalize(
        VectorHelper.subVectors(pos, headPos)
      ).multiplyScalar(speed)
    );
    this.moveTo(targetPos);
  }

  moveTo(pos: PIXI.Point): void {
    this.spine.resolve(pos);
  }

  bodyWidthAt(index: number): number {
    if (this.bodyWidth.length <= index) {
      return 16;
    }
    return this.bodyWidth[index];
  }

  getPosX(i: number, angleOffset: number, lengthOffset: number): number {
    return (
      this.spine.joints[i].x +
      Math.cos(this.spine.angles[i] + angleOffset) *
        (this.bodyWidthAt(i) + lengthOffset)
    );
  }

  getPosY(i: number, angleOffset: number, lengthOffset: number): number {
    return (
      this.spine.joints[i].y +
      Math.sin(this.spine.angles[i] + angleOffset) *
        (this.bodyWidthAt(i) + lengthOffset)
    );
  }

  get x(): number {
    return this.spine.joints[0].x;
  }

  get y(): number {
    return this.spine.joints[0].y;
  }

  drawBody(
    graphics: PIXI.Graphics,
    last: number = this.spine.joints.length - 1
  ) {
    if (this.drawCircles) {
      // draw by walking the spine and drawing a circle every x units
      let dist = 4;
      for (let i = 0; i < last; i++) {
        let currentJoint = this.spine.joints[i];
        let nextJoint = this.spine.joints[i + 1];
        let dx = nextJoint.x - currentJoint.x;
        let dy = nextJoint.y - currentJoint.y;
        let len = Math.hypot(dx, dy);
        let angle = Math.atan2(dy, dx);
        let steps = Math.floor(len / dist);
        for (let j = 0; j < steps; j++) {
          let x = currentJoint.x + Math.cos(angle) * dist * j;
          let y = currentJoint.y + Math.sin(angle) * dist * j;

          // interpolate the body width
          let size =
            this.bodyWidthAt(i) +
            (this.bodyWidthAt(i + 1) - this.bodyWidthAt(i)) * (j / steps);
          graphics.circle(x, y, size);
        }

        // draw the last circle
        graphics.circle(nextJoint.x, nextJoint.y, this.bodyWidthAt(i + 1));
      }

      return;
    }
    let cpX =
      (this.getPosX(0, Math.PI / 2, 0) + this.getPosX(1, Math.PI / 2, 0)) / 2;
    let cpY =
      (this.getPosY(0, Math.PI / 2, 0) + this.getPosY(1, Math.PI / 2, 0)) / 2;

    graphics.moveTo(cpX, cpY);

    let points: number[] = [];

    // Right half of the body
    for (let i = 0; i < last; i++) {
      const cpX =
        (this.getPosX(i, Math.PI / 2, 0) +
          this.getPosX(i + 1, Math.PI / 2, 0)) /
        2;
      const cpY =
        (this.getPosY(i, Math.PI / 2, 0) +
          this.getPosY(i + 1, Math.PI / 2, 0)) /
        2;

      points.push(
        this.getPosX(i, Math.PI / 2, 0),
        this.getPosY(i, Math.PI / 2, 0),
        cpX,
        cpY
      );
    }

    if (this.roundTail <= 0.001) {
      points.push(
        this.getPosX(last, Math.PI / 2, 0),
        this.getPosY(last, Math.PI / 2, 0),
        this.getPosX(last, Math.PI, 0),
        this.getPosY(last, Math.PI, 0)
      );
    } else {
      points.push(
        this.getPosX(last, (Math.PI / 4) * 3, this.roundTail),
        this.getPosY(last, (Math.PI / 4) * 3, this.roundTail),
        this.getPosX(last, Math.PI, 0),
        this.getPosY(last, Math.PI, 0)
      );

      const cpX =
        (this.getPosX(last, -Math.PI / 2, 0) +
          this.getPosX(last - 1, -Math.PI / 2, 0)) /
        2;
      const cpY =
        (this.getPosY(last, -Math.PI / 2, 0) +
          this.getPosY(last - 1, -Math.PI / 2, 0)) /
        2;
      points.push(
        this.getPosX(last, -(Math.PI / 4) * 3, this.roundTail),
        this.getPosY(last, -(Math.PI / 4) * 3, this.roundTail),
        cpX,
        cpY
      );
    }

    // Left half of the body
    for (let i = last; i > 0; i--) {
      const cpX =
        (this.getPosX(i, -Math.PI / 2, 0) +
          this.getPosX(i - 1, -Math.PI / 2, 0)) /
        2;
      const cpY =
        (this.getPosY(i, -Math.PI / 2, 0) +
          this.getPosY(i - 1, -Math.PI / 2, 0)) /
        2;

      points.push(
        this.getPosX(i, -Math.PI / 2, 0),
        this.getPosY(i, -Math.PI / 2, 0),
        cpX,
        cpY
      );
    }

    points.push(
      this.getPosX(0, -Math.PI / 2, 0),
      this.getPosY(0, -Math.PI / 2, 0),
      this.getPosX(0, -Math.PI / 4, 0),
      this.getPosY(0, -Math.PI / 4, 0)
    );

    points.push(
      this.getPosX(0, 0, this.roundHead),
      this.getPosY(0, 0, this.roundHead),
      this.getPosX(0, Math.PI / 4, 0),
      this.getPosY(0, Math.PI / 4, 0)
    );

    cpX =
      (this.getPosX(0, Math.PI / 2, 0) + this.getPosX(1, Math.PI / 2, 0)) / 2;
    cpY =
      (this.getPosY(0, Math.PI / 2, 0) + this.getPosY(1, Math.PI / 2, 0)) / 2;
    points.push(
      this.getPosX(0, Math.PI / 2, 0),
      this.getPosY(0, Math.PI / 2, 0),
      cpX,
      cpY
    );

    for (let i = 0; i < points.length; i += 4) {
      graphics.quadraticCurveTo(
        points[i],
        points[i + 1],
        points[i + 2],
        points[i + 3]
      );
    }

    return points;
  }

  drawEye(
    graphics: PIXI.Graphics,
    jointIndex: number,
    angleOffset: number,
    lengthOffset: number,
    eyeSize: number,
    eyeColor: PIXI.ColorSource = 0xffffff,
    withPupil: boolean = true,
    pupilColor: PIXI.ColorSource = 0x000000,
    pupilSize: number = 0.5
  ): void {
    graphics.circle(
      this.getPosX(jointIndex, angleOffset, lengthOffset),
      this.getPosY(jointIndex, angleOffset, lengthOffset),
      eyeSize / 2
    );

    graphics.fill(eyeColor);

    if (withPupil) {
      graphics.circle(
        this.getPosX(jointIndex, angleOffset, lengthOffset),
        this.getPosY(jointIndex, angleOffset, lengthOffset),
        (eyeSize / 2) * pupilSize
      );

      graphics.fill(pupilColor);
    }
  }

  private drawBodyPoints(graphics: PIXI.Graphics): void {
    graphics.moveTo(
      this.getPosX(0, Math.PI / 2, 0),
      this.getPosY(0, Math.PI / 2, 0)
    );

    // Right half of the fish
    for (let i = 0; i < 9; i++) {
      const cpX =
        (this.getPosX(i, Math.PI / 2, 0) +
          this.getPosX(i + 1, Math.PI / 2, 0)) /
        2;
      const cpY =
        (this.getPosY(i, Math.PI / 2, 0) +
          this.getPosY(i + 1, Math.PI / 2, 0)) /
        2;

      graphics.circle(cpX, cpY, 3).fill(0xff0000);

      graphics
        .circle(
          this.getPosX(i, Math.PI / 2, 0),
          this.getPosY(i, Math.PI / 2, 0),
          3
        )
        .fill(0x00ff00);
    }

    graphics
      .circle(this.getPosX(9, Math.PI, 0), this.getPosY(9, Math.PI, 0), 3)
      .fill(0xff0000);

    graphics
      .circle(
        this.getPosX(9, Math.PI / 2, 0),
        this.getPosY(9, Math.PI / 2, 0),
        3
      )
      .fill(0x00ff00);

    // Left half of the fish
    for (let i = 9; i > 0; i--) {
      const cpX =
        (this.getPosX(i, -Math.PI / 2, 0) +
          this.getPosX(i - 1, -Math.PI / 2, 0)) /
        2;
      const cpY =
        (this.getPosY(i, -Math.PI / 2, 0) +
          this.getPosY(i - 1, -Math.PI / 2, 0)) /
        2;

      graphics.circle(cpX, cpY, 3).fill(0xff0000);

      graphics
        .circle(
          this.getPosX(i, -Math.PI / 2, 0),
          this.getPosY(i, -Math.PI / 2, 0),
          3
        )
        .fill(0x00ff00);
    }

    graphics
      .circle(
        this.getPosX(0, -Math.PI / 2, 0),
        this.getPosY(0, -Math.PI / 2, 0),
        3
      )
      .fill(0x00ff00);

    graphics
      .circle(
        this.getPosX(0, -Math.PI / 6, 0),
        this.getPosY(0, -Math.PI / 6, 0),
        3
      )
      .fill(0xff0000);

    graphics
      .circle(this.getPosX(0, 0, 30), this.getPosY(0, 0, 30), 3)
      .fill(0x00ff00);

    graphics
      .circle(
        this.getPosX(0, Math.PI / 6, 0),
        this.getPosY(0, Math.PI / 6, 0),
        3
      )
      .fill(0xff0000);

    graphics
      .circle(
        this.getPosX(0, Math.PI / 2, 0),
        this.getPosY(0, Math.PI / 2, 0),
        3
      )
      .fill(0x00ff00);

    //graphics.closePath();
  }
}
