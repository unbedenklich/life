import * as PIXI from "pixi.js";

export class VectorHelper {
  static addVectors(vec1: PIXI.Point, vec2: PIXI.Point): PIXI.Point {
    return new PIXI.Point(vec1.x + vec2.x, vec1.y + vec2.y);
  }

  static subVectors(vec1: PIXI.Point, vec2: PIXI.Point): PIXI.Point {
    return new PIXI.Point(vec1.x - vec2.x, vec1.y - vec2.y);
  }

  static fromAngle(angle: number): PIXI.Point {
    return new PIXI.Point(Math.cos(angle), Math.sin(angle));
  }

  static normalize(vec: PIXI.Point): PIXI.Point {
    const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    return length === 0
      ? new PIXI.Point(0, 0)
      : new PIXI.Point(vec.x / length, vec.y / length);
  }

  static multiplyScalar(vec: PIXI.Point, scalar: number): PIXI.Point {
    return new PIXI.Point(vec.x * scalar, vec.y * scalar);
  }

  static angle(vec: PIXI.Point): number {
    return Math.atan2(vec.y, vec.x);
  }

  static constrainAngle(
    curAngle: number,
    prevAngle: number,
    maxDiff: number
  ): number {
    let diff = curAngle - prevAngle;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    if (diff > maxDiff) return prevAngle + maxDiff;
    if (diff < -maxDiff) return prevAngle - maxDiff;
    return curAngle;
  }

  static constrainDistance(
    joint: PIXI.Point,
    target: PIXI.Point,
    distance: number
  ): PIXI.Point {
    let direction = VectorHelper.normalize(
      VectorHelper.subVectors(joint, target)
    );
    return VectorHelper.addVectors(
      target,
      VectorHelper.multiplyScalar(direction, distance)
    );
  }

  static relativeAngleDiff(angle1: number, angle2: number): number {
    let diff = angle2 - angle1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
  }
}
