import * as PIXI from "pixi.js";
import { VectorHelper } from "../Vector";

export class Chain {
  joints: PIXI.Point[];
  linkSize: number;
  angles: number[];
  angleConstraint: number;

  constructor(
    origin: PIXI.Point,
    jointCount: number,
    linkSize: number,
    angleConstraint: number = Math.PI * 2
  ) {
    this.linkSize = linkSize;
    this.angleConstraint = angleConstraint;
    this.joints = [];
    this.angles = [];

    this.joints.push(new PIXI.Point(origin.x, origin.y));
    this.angles.push(0);

    for (let i = 1; i < jointCount; i++) {
      this.joints.push(
        new PIXI.Point(
          this.joints[i - 1].x,
          this.joints[i - 1].y + this.linkSize
        )
      );
      this.angles.push(0);
    }
  }

  resolve(pos: PIXI.Point): void {
    this.angles[0] = VectorHelper.angle(
      VectorHelper.subVectors(pos, this.joints[0])
    );
    this.joints[0] = new PIXI.Point(pos.x, pos.y);

    for (let i = 1; i < this.joints.length; i++) {
      let curAngle = VectorHelper.angle(
        VectorHelper.subVectors(this.joints[i - 1], this.joints[i])
      );
      this.angles[i] = VectorHelper.constrainAngle(
        curAngle,
        this.angles[i - 1],
        this.angleConstraint
      );
      let newPos = VectorHelper.subVectors(
        this.joints[i - 1],
        VectorHelper.multiplyScalar(
          VectorHelper.fromAngle(this.angles[i]),
          this.linkSize
        )
      );
      this.joints[i] = newPos;
    }
  }

  fabrikResolve(pos: PIXI.Point, anchor: PIXI.Point): void {
    this.joints[0] = new PIXI.Point(pos.x, pos.y);
    for (let i = 1; i < this.joints.length; i++) {
      this.joints[i] = VectorHelper.constrainDistance(
        this.joints[i],
        this.joints[i - 1],
        this.linkSize
      );
    }

    // Backward pass
    this.joints[this.joints.length - 1] = new PIXI.Point(anchor.x, anchor.y);
    for (let i = this.joints.length - 2; i >= 0; i--) {
      this.joints[i] = VectorHelper.constrainDistance(
        this.joints[i],
        this.joints[i + 1],
        this.linkSize
      );
    }
  }

  display(graphics: PIXI.Graphics, sizes?: number[]): void {
    for (let i = 0; i < this.joints.length - 1; i++) {
      let startJoint = this.joints[i];
      let endJoint = this.joints[i + 1];
      graphics.moveTo(startJoint.x, startJoint.y);
      graphics.lineTo(endJoint.x, endJoint.y);
    }

    for (let i = 0; i < this.joints.length; i++) {
      let joint = this.joints[i];
      let size = sizes && sizes.length > i ? sizes[i] : 16;
      graphics.circle(joint.x, joint.y, size);
    }

    graphics.stroke({ color: 0xffffff, width: 4 });
  }
}
