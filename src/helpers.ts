import * as PIXI from "pixi.js";

export function createTexture(
  width: number,
  height: number,
  getPixelColor: (x: number, y: number) => [number, number, number, number]
): PIXI.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelColor(x, y);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = PIXI.Texture.from(canvas);
  canvas.remove();
  return texture;
}
