import { Organism } from "./organisms/Organism";

import * as PIXI from "pixi.js";
import { Player } from "./Player";
import { BlobOrganism } from "./organisms/Blob";

export class Level {
  index: number;

  container = new PIXI.Container();
  organisms: Organism[] = [];

  maxOrganisms = 20;

  options: any;

  speedModifier = 1;

  organismClass: typeof BlobOrganism;

  constructor(index: number, options: any) {
    this.index = index;

    this.maxOrganisms = 0;

    this.container.zIndex = index;

    if (options.organismClass) {
      this.organismClass = options.organismClass;
    } else {
      this.organismClass = BlobOrganism;
    }

    addChild(this.container);

    this.options = options;
  }

  update(dt: number, total: number, player: Player) {
    this.organisms.forEach((organism) => {
      organism.update(dt, total, this.speedModifier);
      if (organism.container.alpha < 1) {
        organism.container.alpha += dt / 3000;
      }
    });

    if (this.organisms.length < this.maxOrganisms) {
      this.spawnOrganism(player);
    }

    // remove dead organisms and those too far away from player
    this.organisms = this.organisms.filter((organism) => {
      let distance = Math.hypot(organism.x - player.x, organism.y - player.y);

      if (organism.dead || distance > 4000 / camera.zoom) {
        organism.destroy();
        return false;
      }

      return true;
    });
  }

  spawnOrganism(player: Player) {
    this.options = this.options ?? {};
    this.options.level = this.index;

    let angle = Math.random() * Math.PI * 2;
    let radius = Math.random() * 2500 + 1500;

    radius /= camera.zoom;

    let x = Math.cos(angle) * radius + player.x;
    let y = Math.sin(angle) * radius + player.y;

    this.options.x = x;
    this.options.y = y;

    this.options.direction = Math.random() * Math.PI * 2;

    let organism = new this.organismClass(this.options);
    organism.container.alpha = 0;
    this.container.addChild(organism.container);
    this.organisms.push(organism);
  }

  removeLevel() {
    this.organisms.forEach((organism) => {
      organism.destroy();
    });

    this.organisms = [];

    this.container.destroy({ children: true });
  }
}
