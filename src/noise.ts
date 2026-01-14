import { createNoise2D, createNoise3D, type NoiseFunction2D, type NoiseFunction3D } from "simplex-noise";
import alea from "alea";

export type UberNoiseOptions = {
  seed?: string | number;
  min?: number;
  max?: number;
  scale?: number;
  power?: number;
  octaves?: number;
  gain?: number;
  lacunarity?: number;
};

export default class UberNoise {
  private noise2D: NoiseFunction2D;
  private noise3D: NoiseFunction3D;
  private min: number;
  private max: number;
  private scale: number;
  private power: number;
  private octaves: number;
  private gain: number;
  private lacunarity: number;
  private layers: UberNoise[] = [];

  constructor(opts: UberNoiseOptions = {}) {
    const prng = alea(opts.seed ?? Math.random());
    this.noise2D = createNoise2D(prng);
    this.noise3D = createNoise3D(prng);
    this.min = opts.min ?? -1;
    this.max = opts.max ?? 1;
    this.scale = opts.scale ?? 1;
    this.power = opts.power ?? 1;
    this.octaves = opts.octaves ?? 0;
    this.gain = opts.gain ?? 0.5;
    this.lacunarity = opts.lacunarity ?? 2;

    for (let i = 0; i < this.octaves; i++) {
      this.layers.push(new UberNoise({ seed: prng() }));
    }
  }

  get(x: number, y: number = 0, z?: number): number {
    let n: number;
    if (this.layers.length === 0) {
      n = z !== undefined
        ? this.noise3D(x * this.scale, y * this.scale, z * this.scale)
        : this.noise2D(x * this.scale, y * this.scale);
    } else {
      n = 0;
      let amp = 1, freq = this.scale, maxAmp = 0;
      for (const layer of this.layers) {
        n += layer.getNorm(x * freq, y * freq, z !== undefined ? z * freq : undefined) * amp;
        maxAmp += amp;
        amp *= this.gain;
        freq *= this.lacunarity;
      }
      n /= maxAmp;
    }

    if (this.power !== 1) {
      n = (Math.pow((n + 1) * 0.5, this.power) - 0.5) * 2;
    }

    return (n + 1) * 0.5 * (this.max - this.min) + this.min;
  }

  private getNorm(x: number, y: number, z?: number): number {
    return z !== undefined
      ? this.noise3D(x, y, z)
      : this.noise2D(x, y);
  }
}
