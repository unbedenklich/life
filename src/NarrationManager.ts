import { sound } from "@pixi/sound";

export class NarrationManager {
  narrationQueue: string[] = [];
  currentNarration: string = "";

  isNarrating: boolean = false;

  hasEvolved: boolean = true;
  hasEaten: boolean = false;
  isHunted: boolean = false;

  currentLevel: number = 1;

  currentlyPlaying: string | undefined = undefined;
  currentlyPlayingTime: number = 0;

  subtitles: any = undefined;

  addedDeath: boolean = false;

  levelAudios: string[][] = [
    [],
    ["introOld1", "introOld2"],
    ["firstEvolveCell"],
    ["secondEvolveCell"],
    ["firstEvolveWorm"],
    ["secondEvolveWorm"],
    ["thirdEvolveWorm"],
    ["firstEvolveFish"],
    ["secondEvolveFish"],
    ["thirdEvolveFish"],
    ["firstEvolveShark"],
  ];

  levelYears: string[] = [
    "",
    "3.5 billion years ago",
    "3.4 billion years ago",
    "3.2 billion years ago",
    "2.8 billion years ago",
    "2.2 billion years ago",
    "1.5 billion years ago",
    "500 million years ago",
    "200 million years ago",
    "100 million years ago",
    "10 million years ago",
  ];

  playedCurrentTimeline: boolean = false;

  timeline = [
    "",
    "timeAgo1",
    "timeAgo2",
    "timeAgo3",
    "timeAgo4",
    "timeAgo5",
    "timeAgo6",
    "timeAgo7",
    "timeAgo8",
    "timeAgo9",
  ];

  deathAudios: string[] = ["death1", "death2", "death3", "death4"];

  winDieAudios: string[] = ["winDie1", "winDie2", "winDie3"];

  audios: Record<string, { url: string; volume?: number; year?: string }> = {
    //narration Old files
    introOld1: {
      url: "./narration/narrationOld/intro.mp3",
      volume: 0.3,
    },
    introOld2: {
      url: "./narration/narrationOld/intro2.mp3",
      volume: 0.3,
    },
    cellEatsOld: {
      url: "./narration/narrationOld/cellEats.mp3",
      volume: 0.3,
    },
    cellFindsEnemyOld: {
      url: "./narration/narrationOld/cellFindsEnemy.mp3",
      volume: 0.3,
    },

    //narration V1 files
    enemyThreat: {
      url: "./narration/narrationV1/enemyThreat.mp3",
      volume: 0.3,
    },
    firstCellEvolveV1: {
      url: "./narration/narrationV1/firstCellEvolve.mp3",
      volume: 0.3,
    },
    secondCellEvolveV1: {
      url: "./narration/narrationV1/secondCellEvolve.mp3",
      volume: 0.3,
    },
    environmentEvolution: {
      url: "./narration/narrationV1/environmentEvolution.mp3",
      volume: 0.3,
    },
    firstWormEvolution: {
      url: "./narration/narrationV1/firstWormEvolution.mp3",
      volume: 0.3,
    },
    wormHeadExplanation: {
      url: "./narration/narrationV1/wormHeadExplanation.mp3",
      volume: 0.3,
    },
    introV1: { url: "./narration/narrationV1/intro1V1.mp3", volume: 0.3 },
    intro2V1: { url: "./narration/narrationV1/intro2V1.mp3", volume: 0.3 },

    //narration V2 files
    intro1V2: { url: "./narration/narrationV2/intro1V2.mp3", volume: 0.3 },
    intro2V2: { url: "./narration/narrationV2/intro2V2.mp3", volume: 0.3 },
    intro3V2: { url: "./narration/narrationV2/intro3V2.mp3", volume: 0.3 },
    firstCellEvolveV2: {
      url: "./narration/narrationV2/firstCellEvolution.mp3",
      volume: 0.3,
    },
    secondCellEvolveV2: {
      url: "./narration/narrationV2/secondCellEvolution.mp3",
      volume: 0.3,
    },

    //facts
    fact1: { url: "./narration/facts/fact1.mp3", volume: 0.3 },
    fact2: { url: "./narration/facts/fact2.mp3", volume: 0.3 },
    fact3: { url: "./narration/facts/fact3.mp3", volume: 0.3 },
    fact4: { url: "./narration/facts/fact4.mp3", volume: 0.3 },
    fact5: { url: "./narration/facts/fact5.mp3", volume: 0.3 },
    fact6: { url: "./narration/facts/fact6.mp3", volume: 0.3 },
    fact7: { url: "./narration/facts/fact7.mp3", volume: 0.3 },
    fact8: { url: "./narration/facts/fact8.mp3", volume: 0.3 },
    fact9: { url: "./narration/facts/fact9.mp3", volume: 0.3 },
    fact10: { url: "./narration/facts/fact10.mp3", volume: 0.3 },

    //philosophy
    darwin: { url: "./narration/philosophy/darwin.mp3", volume: 0.3 },
    heraclitus: { url: "./narration/philosophy/heraclitus.mp3", volume: 0.3 },
    nietzsche: { url: "./narration/philosophy/nietzsche.mp3", volume: 0.3 },
    sagan: { url: "./narration/philosophy/sagan.mp3", volume: 0.3 },
    tzu: { url: "./narration/philosophy/tzu.mp3", volume: 0.3 },
    watts: { url: "./narration/philosophy/watts.mp3", volume: 0.3 },
    what_is_life: {
      url: "./narration/philosophy/what_is_life.mp3",
      volume: 0.3,
    },
    lifeBegins: { url: "./narration/philosophy/lifeBegins.mp3", volume: 0.3 },

    //evloution
    firstEvolveCell: {
      url: "./narration/evolution/firstEvolveCell.mp3",
      volume: 0.3,
    },
    secondEvolveCell: {
      url: "./narration/evolution/secondEvolveCell.mp3",
      volume: 0.3,
    },
    firstEvolveWorm: {
      url: "./narration/evolution/firstEvolveWorm.mp3",
      volume: 0.3,
    },
    secondEvolveWorm: {
      url: "./narration/evolution/secondEvolveWorm.mp3",
      volume: 0.3,
    },
    thirdEvolveWorm: {
      url: "./narration/evolution/thirdEvolveWorm.mp3",
      volume: 0.3,
    },
    firstEvolveFish: {
      url: "./narration/evolution/firstEvolveFish.mp3",
      volume: 0.3,
    },
    secondEvolveFish: {
      url: "./narration/evolution/secondEvolveFish.mp3",
      volume: 0.3,
    },
    thirdEvolveFish: {
      url: "./narration/evolution/thirdEvolveFish.mp3",
      volume: 0.3,
    },
    firstEvolveShark: {
      url: "./narration/evolution/firstEvolveShark.mp3",
      volume: 0.3,
    },

    //timeline
    timeAgo1: {
      url: "./narration/timeline/timelineAgo3.5Billion.mp3",
      volume: 0.3,
    },
    timeAgo2: {
      url: "./narration/timeline/timelineAgo3.4Billion.mp3",
      volume: 0.3,
    },
    timeAgo3: {
      url: "./narration/timeline/timelineAgo3.2Billion.mp3",
      volume: 0.3,
    },
    timeAgo4: {
      url: "./narration/timeline/timelineAgo2.8Billion.mp3",
      volume: 0.3,
    },
    timeAgo5: {
      url: "./narration/timeline/timelineAgo2.2Billion.mp3",
      volume: 0.3,
    },
    timeAgo6: {
      url: "./narration/timeline/timelineAgo1.5Billion.mp3",
      volume: 0.3,
    },
    timeAgo7: {
      url: "./narration/timeline/timelineAgo1Billion.mp3",
      volume: 0.3,
    },
    timeAgo8: {
      url: "./narration/timeline/timelineAgo200Million.mp3",
      volume: 0.3,
    },
    timeAgo9: {
      url: "./narration/timeline/timelineAgo100Million.mp3",
      volume: 0.3,
    },

    //death
    death1: { url: "./narration/death/death1.mp3", volume: 0.3 },
    death2: { url: "./narration/death/death2.mp3", volume: 0.3 },
    death3: { url: "./narration/death/death3.mp3", volume: 0.3 },
    death4: { url: "./narration/death/death4.mp3", volume: 0.3 },
    winDie1: { url: "./narration/death/winDie1.mp3", volume: 0.3 },
    winDie2: { url: "./narration/death/winDie2.mp3", volume: 0.3 },
    winDie3: { url: "./narration/death/winDie3.mp3", volume: 0.3 },
  };

  funFacts: string[] = [
    "fact1",
    "fact2",
    "fact3",
    "fact4",
    "fact5",
    "fact6",
    "fact7",
    "fact8",
    "fact9",
    "fact10",
    "darwin",
    "heraclitus",
    "nietzsche",
    "sagan",
    "tzu",
    "watts",
    "what_is_life",
    "lifeBegins",
  ];

  constructor(level: number) {
    this.narrationQueue = [];
    this.currentNarration = "";
    this.isNarrating = false;
    this.currentLevel = level;

    for (let key of Object.keys(this.audios)) {
      sound.add(key, this.audios[key]);
    }
  }

  addToQueue(narration: string) {
    console.log("add to queue", narration);
    if (!narration) return;

    this.narrationQueue.push(narration);
  }

  playNextQueueItem() {
    this.isNarrating = true;
    this.currentNarration = this.narrationQueue.shift() ?? "";

    this.currentlyPlaying = this.currentNarration;
    this.currentlyPlayingTime = 0;
    sound.play(this.currentNarration, () => {
      this.currentlyPlaying = undefined;
      this.isNarrating = false;

      this.subtitles = undefined;
    });
  }

  gameOver() {
    if (this.addedDeath) return;

    if (this.currentlyPlaying) sound.stop(this.currentlyPlaying);

    this.isNarrating = false;
    this.currentlyPlaying = undefined;

    // play death narration when player dies and remove all other narrations
    this.narrationQueue = [];
    this.addToQueue(
      this.deathAudios[Math.floor(Math.random() * this.deathAudios.length)]
    );

    this.addedDeath = true;
    // this.addToQueue("gameOver");
  }

  winDie() {
    // play death narration when player wins and remove all other narrations
    this.narrationQueue = [];
    this.addToQueue(
      this.winDieAudios[Math.floor(Math.random() * this.winDieAudios.length)]
    );
  }

  async updateSubtitles() {
    if (this.currentlyPlaying) {
      let subtitles = this.audios[this.currentlyPlaying].url
        .replace("./narration", "./subtitles")
        .replace(".mp3", ".json");

      if (!this.subtitles && subtitles) {
        // load json
        try {
          const response = await fetch(subtitles);
          this.subtitles = await response.json();
        } catch (error) {
          console.error("Error fetching subtitles", error);
        }
      } else {
        let segment = -1;
        // get time
        for (let i = 0; i < this.subtitles.segments.length; i++) {
          if (
            this.subtitles.segments[i].start <= this.currentlyPlayingTime &&
            this.subtitles.segments[i].end >= this.currentlyPlayingTime
          ) {
            segment = i;
            break;
          }
        }

        let part1 = "",
          part2 = "";
        if (segment >= 0) {
          // go through words
          for (let word of this.subtitles.segments[segment].words) {
            if (word.start <= this.currentlyPlayingTime) {
              part1 += " " + word.word;
            } else {
              part2 += " " + word.word;
            }
          }
        }

        if (part1 || part2) {
          // get subtitles ui
          const subtitlesUI = document.getElementById("subtitles");
          if (subtitlesUI) {
            subtitlesUI.innerHTML =
              '<span class="text-white">' +
              part1 +
              '</span> <span class="text-white/50">' +
              part2 +
              "</span>";
          }
        } else {
          const subtitlesUI = document.getElementById("subtitles");
          if (subtitlesUI) {
            subtitlesUI.innerHTML = "";
          }
        }
      }
    }
  }

  update(dt: number) {
    this.currentlyPlayingTime += dt / 1000;

    this.updateSubtitles();

    // play next narration if not playing
    if (!this.isNarrating && this.narrationQueue.length) {
      this.playNextQueueItem();
    }

    if (this.addedDeath) return;

    if (this.hasEvolved && this.currentLevel < this.levelAudios.length) {
      // add narration for current level
      for (let audio of this.levelAudios[this.currentLevel]) {
        this.addToQueue(audio);
      }

      if (this.levelYears.length > this.currentLevel) {
        let yearsUI = document.getElementById("years");
        if (yearsUI) {
          yearsUI.innerText = this.levelYears[this.currentLevel];
        }
      }

      this.playedCurrentTimeline = false;

      this.hasEvolved = false;
    }

    // if function for when player gets maximum evolution which is 9 do winDie
    if (this.hasEvolved && this.currentLevel === 11) {
      this.winDie();
      this.hasEvolved = false;
    }

    // if (!this.isNarrating) {
    //   if (Math.random() < (0.02 * dt) / 1000) {
    //     let index = Math.floor(Math.random() * this.funFacts.length);
    //     let randomFact = this.funFacts[index];

    //     this.funFacts.splice(index, 1);

    //     this.addToQueue(randomFact);
    //   }
    // }

    if (
      !this.isNarrating &&
      !this.playedCurrentTimeline &&
      this.currentLevel < this.timeline.length &&
      game.player.percentagePoints < 0.7 &&
      Math.random() < (0.1 * dt) / 1000
    ) {
      this.addToQueue(this.timeline[this.currentLevel]);
      this.playedCurrentTimeline = true;
    }
  }
}
