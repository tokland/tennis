import { Formatter, FracturedJsonOptions } from "fracturedjsonjs";
import * as readline from "readline";

/* Logger */

const formatter = new Formatter();
const options = new FracturedJsonOptions();
options.MaxTotalLineLength = 80;
options.MaxInlineComplexity = 1;
formatter.Options = options;

function log(obj: any): void {
  //const textFromObj = stringify(obj, { maxLength: 80 });
  const textFromObj = formatter.Serialize(obj);
  console.debug(textFromObj);
}

/* Generic */

const gravityAccel = -9.8;

class Vector {
  constructor(public x: number, public y: number, public z: number) {}

  move(diff: Vector): Vector {
    return new Vector(this.x + diff.x, this.y + diff.y, this.z + diff.z);
  }

  set(newValues: Partial<Vector>): Vector {
    return new Vector(
      newValues.x ?? this.x,
      newValues.y ?? this.y,
      newValues.z ?? this.z
    );
  }
}

type Position = Vector;

class Kinematics {
  constructor(
    private position: Vector,
    private speed: Vector,
    private accel: Vector
  ) {}

  update(tick: number): Kinematics {
    const newPosition = this.position.move(
      new Vector(this.speed.x * tick, this.speed.y * tick, this.speed.z * tick)
    );

    const newSpeedZ = this.speed.z + this.accel.z * tick;
    const newSpeedZ2 =
      newPosition.z <= 0 && newSpeedZ < 0 ? -(newSpeedZ * 0.9) : newSpeedZ;

    const newSpeed = this.speed
      .move(new Vector(this.accel.x * tick, this.accel.y * tick, 0))
      .set({ z: newSpeedZ2 });

    return new Kinematics(newPosition, newSpeed, this.accel);
  }
}

/* Ball */

type BallProps = {
  radius: number;
};

type BallState = {
  kinematics: Kinematics;
};

class Ball {
  constructor(private props: BallProps, private state: BallState) {}

  static create(props: BallProps): Ball {
    return new Ball(props, {
      kinematics: new Kinematics(
        new Vector(0, 0, 1),
        new Vector(0, 0, 0),
        new Vector(0, 0, 0)
      ),
    });
  }

  private updateState(newPartialState: Partial<BallState>): Ball {
    return new Ball(this.props, { ...this.state, ...newPartialState });
  }

  toJSON() {
    return this.state.kinematics;
  }

  update(tick: number): Ball {
    return this.updateState({ kinematics: this.state.kinematics.update(tick) });
  }
}

/* Player */

type PlayerI = {
  props: {
    name: string;
  };
  state: {
    kinematics: Kinematics;
  };
};

class Player {
  constructor(
    private props: PlayerI["props"],
    private state: PlayerI["state"]
  ) {}

  static create(props: PlayerI["props"]): Player {
    return new Player(props, {
      kinematics: new Kinematics(
        new Vector(0, 0, 0),
        new Vector(0, 0, 0),
        new Vector(0, 0, 0)
      ),
    });
  }

  update(tick: number): Player {
    return new Player(this.props, {
      ...this.state,
      kinematics: this.state.kinematics.update(tick),
    });
  }

  toJSON() {
    return this.state.kinematics;
  }
}

interface PlayerActor {}

class AutoPlayerActor implements PlayerActor {
  constructor(
    private game: Game,
    private player: Player,
    private state: {
      prevGame: Game;
      status: { type: "waiting" } | { type: "moving"; to: Position };
    }
  ) {}

  update(tick: number): Player {
    return this.player;
  }

  private goToBestPositionForHit(ball: Ball): Player {
    return this.player;
  }
}

/* Game */

type Court = {
  length: number;
  width: number;
  netHeight: number;
};

type GameProps = {};

type GameState = {
  court: Court;
  ball: Ball;
  players: { a: Player; b: Player };
};

const cm = (x: number) => x / 100;

class Game {
  constructor(private props: GameProps, private state: GameState) {}

  static create(): Game {
    return new Game(
      {},
      {
        court: {
          length: 10,
          width: 5,
          netHeight: 2,
        },
        ball: Ball.create({ radius: cm(5) }),
        players: {
          a: Player.create({ name: "A" }),
          b: Player.create({ name: "B" }),
        },
      }
    );
  }

  update(tick: number): Game {
    return new Game(this.props, {
      ...this.state,
      ball: this.state.ball.update(tick),
      players: {
        a: this.state.players.a.update(tick),
        b: this.state.players.b.update(tick),
      },
    });
  }

  toJSON() {
    return {
      ball: this.state.ball,
      //playerA: this.state.players.a,
      //playerB: this.state.players.b,
    };
  }
}

function wait(secs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, secs / 1000));
}

function waitForIntro(prompt: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

async function run() {
  let game = Game.create();
  let time = 0;
  const tick = 0.01;

  do {
    log(game);
    //await wait(tick);
    await waitForIntro(`Elapsed: ${time.toFixed(2)}`);
    game = game.update(tick);
    time += tick;
  } while (true);
}

run();
