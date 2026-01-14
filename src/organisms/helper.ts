import * as PIXI from "pixi.js";

export function drawCurvedLineWithWaves(
  ctx: PIXI.Graphics,
  startX: number,
  startY: number,
  dx: number,
  dy: number,
  length: number,
  amplitude: number,
  waveCount: number
) {
  // Normalize the direction vector
  const magnitude = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / magnitude;
  const uy = dy / magnitude;

  // Perpendicular vector (rotating 90 degrees)
  const perpX = -uy;
  const perpY = ux;

  // Calculate the length of each wave segment
  const segmentLength = length / waveCount;

  let currentX = startX;
  let currentY = startY;

  for (let i = 0; i < waveCount; i++) {
    // Calculate the end point of the current segment
    const endX = currentX + ux * segmentLength;
    const endY = currentY + uy * segmentLength;

    // Calculate the control point
    const controlX =
      currentX +
      ux * (segmentLength / 2) +
      perpX * amplitude * (i % 2 === 0 ? 1 : -1);
    const controlY =
      currentY +
      uy * (segmentLength / 2) +
      perpY * amplitude * (i % 2 === 0 ? 1 : -1);

    // Draw the curve
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);

    // Update current position for the next segment
    currentX = endX;
    currentY = endY;
  }
}
