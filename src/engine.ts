import * as PIXI from "pixi.js";
import { EventQueue, World } from "@dimforge/rapier2d";

// Global declarations
declare global {
  var engine: Engine;
  var container: PIXI.Container;
  var width: number;
  var height: number;
  var keys: Record<string, boolean>;
  var camera: Camera;
  var RAPIER: typeof import("@dimforge/rapier2d");
  var physicsWorld: World;
  var parallaxLayers: ParallaxLayer[];
  var showingDebug: boolean;
  function addChild(...children: PIXI.Container[]): void;
  function newParallaxLayer(xSpeed: number, ySpeed?: number): ParallaxLayer;
}

export class ParallaxLayer extends PIXI.Container {
  xSpeed = 1;
  ySpeed = 1;
}

export class Camera {
  private _x = 0;
  private _y = 0;
  private _zoom = 1;
  targetX = 0;
  targetY = 0;
  targetZoom = 1;
  interpolationSpeedZoom = 0.05;
  interpolationSpeedPosition = 0.05;

  update(dt: number) {
    if (Math.abs(this.targetX - this._x) > 0.0001 || Math.abs(this.targetY - this._y) > 0.0001) {
      const f = 1 - Math.pow(1 - this.interpolationSpeedPosition, dt / (1000 / 60));
      this._x += (this.targetX - this._x) * f;
      this._y += (this.targetY - this._y) * f;
      engine.stageContainer.x = -this._x;
      engine.stageContainer.y = -this._y;
      parallaxLayers?.forEach(l => { l.x = -this._x * l.xSpeed; l.y = -this._y * l.ySpeed; });
    }
    if (Math.abs(this.targetZoom - this._zoom) > 0.001) {
      const f = 1 - Math.pow(1 - this.interpolationSpeedZoom, dt / (1000 / 60));
      this._zoom += (this.targetZoom - this._zoom) * f;
      engine.zoomContainer.scale.set(this._zoom);
    }
  }

  get x() { return this._x; }
  set x(v) { this._x = v; engine.stageContainer.x = -v; parallaxLayers?.forEach(l => l.x = -v * l.xSpeed); }
  get y() { return this._y; }
  set y(v) { this._y = v; engine.stageContainer.y = -v; parallaxLayers?.forEach(l => l.y = -v * l.ySpeed); }
  get zoom() { return this._zoom; }
  set zoom(v) { this._zoom = v; engine.zoomContainer.scale.set(v); }
}

type EngineOptions = {
  setup?: () => Promise<void> | void;
  update?: (dt: number, total: number) => void;
  width?: number;
  height?: number;
  div?: string | HTMLElement;
  backgroundColor?: PIXI.ColorSource;
};

export default class Engine {
  app!: PIXI.Application;
  mainContainer: PIXI.Container;
  zoomContainer: PIXI.Container;
  stageContainer: PIXI.Container;
  keys: Record<string, boolean> = {};
  paused = false;
  private opts: EngineOptions;
  private minWidth: number;
  private minHeight: number;
  private _scale = 1;
  private parent: HTMLElement | null = null;

  static run(opts: EngineOptions = {}) { return new Engine(opts); }

  constructor(opts: EngineOptions = {}) {
    this.opts = opts;
    this.minWidth = opts.width ?? 900;
    this.minHeight = opts.height ?? 600;
    if (opts.div) {
      this.parent = typeof opts.div === "string" ? document.getElementById(opts.div) : opts.div;
    }

    this.mainContainer = new PIXI.Container();
    this.zoomContainer = new PIXI.Container();
    this.stageContainer = new PIXI.Container();
    this.stageContainer.sortableChildren = true;
    this.zoomContainer.sortableChildren = true;

    globalThis.engine = this;
    globalThis.container = this.stageContainer;
    globalThis.width = this.minWidth;
    globalThis.height = this.minHeight;
    globalThis.keys = this.keys;
    globalThis.showingDebug = false;
    globalThis.addChild = (...c) => c.forEach(child => this.stageContainer.addChild(child));
    globalThis.parallaxLayers = [];
    globalThis.newParallaxLayer = (xSpeed, ySpeed) => {
      const layer = new ParallaxLayer();
      layer.xSpeed = xSpeed;
      layer.ySpeed = ySpeed ?? xSpeed;
      layer.zIndex = Math.floor((xSpeed - 1) * 1000);
      parallaxLayers.push(layer);
      this.zoomContainer.addChild(layer);
      return layer;
    };

    this.init();
  }

  private async init() {
    // Init physics
    const RAPIER = await import("@dimforge/rapier2d");
    globalThis.RAPIER = RAPIER;
    globalThis.physicsWorld = new RAPIER.World(new RAPIER.Vector2(0, 0));

    // Init camera
    globalThis.camera = new Camera();

    // Init PIXI
    this.app = new PIXI.Application();
    const w = this.parent?.clientWidth ?? window.innerWidth;
    const h = this.parent?.clientHeight ?? window.innerHeight;

    await this.app.init({ width: w, height: h, antialias: true, backgroundColor: this.opts.backgroundColor ?? 0 });
    (this.parent ?? document.body).appendChild(this.app.canvas);

    this.app.stage.addChild(this.mainContainer);
    this.mainContainer.addChild(this.zoomContainer);
    this.zoomContainer.addChild(this.stageContainer);
    this.mainContainer.position.set(w / 2, h / 2);

    this._scale = Math.min(w / this.minWidth, h / this.minHeight);
    this.mainContainer.scale.set(this._scale, -this._scale);

    window.addEventListener("resize", () => {
      const w = this.parent?.clientWidth ?? window.innerWidth;
      const h = this.parent?.clientHeight ?? window.innerHeight;
      this.app.renderer.resize(w, h);
      this.mainContainer.position.set(w / 2, h / 2);
      this._scale = Math.min(w / this.minWidth, h / this.minHeight);
      this.mainContainer.scale.set(this._scale, -this._scale);
    });

    window.addEventListener("keydown", e => {
      if (this.paused) return;
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", e => {
      if (e.key === "0") this.paused = !this.paused;
      if (this.paused) return;
      this.keys[e.key.toLowerCase()] = false;
    });

    if (this.opts.setup) await this.opts.setup.call(this.opts);

    let total = 0;
    const update = this.opts.update?.bind(this.opts);
    this.app.ticker.add(ticker => {
      if (this.paused) return;
      const dt = ticker.deltaMS;
      total += dt;
      physicsWorld.timestep = dt * 0.001;
      physicsWorld.step();
      camera.update(dt);
      if (update) update(dt, total);
    });
  }
}
