const gravityAccel = -9.8;

class Vector {
    constructor(public x: number, public y: number, public z: number) {}

    move(diff: Vector): Vector {
        return new Vector(this.x + diff.x, this.y + diff.y, this.z + diff.z);
    }

    set(v: Partial<Vector>): Vector {
        return new Vector(v.x ?? this.x, v.y ?? this.y, v.z ?? this.z);
    }
}

type Position = Vector;

class Kinematics {
    constructor(public position: Vector, private speed: Vector, private accel: Vector) {}

    update(tick: number): Kinematics {
        const newPosition = this.position.move(
            new Vector(this.speed.x * tick, this.speed.y * tick, this.speed.z * tick)
        );

        const sx = this.speed.x + this.accel.x * tick;
        const sy = this.speed.y + this.accel.y * tick;
        const sz = this.speed.z + this.accel.z * tick;
        const sz2 = newPosition.z <= 0 && sz < 0 ? -(sz * 0.9) : sz;
        const newSpeed = new Vector(sx, sy, sz2);

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

export class Ball {
    constructor(private props: BallProps, private state: BallState) {}

    static create(props: BallProps): Ball {
        return new Ball(props, {
            kinematics: new Kinematics(
                new Vector(0, -1, 4),
                new Vector(0, 0, 0),
                new Vector(0, 0, gravityAccel)
            ),
        });
    }

    get position(): Vector {
        return this.state.kinematics.position;
    }

    get radius(): number {
        return this.props.radius;
    }

    private updateState(newPartialState: Partial<BallState>): Ball {
        return new Ball(this.props, { ...this.state, ...newPartialState });
    }

    toJSON() {
        return this.state.kinematics;
    }

    update(tick: number): Ball {
        return this.updateState({
            kinematics: this.state.kinematics.update(tick),
        });
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
    constructor(private props: PlayerI["props"], private state: PlayerI["state"]) {}

    static create(props: PlayerI["props"]): Player {
        return new Player(props, {
            kinematics: new Kinematics(new Vector(0, 0, 0), new Vector(0, 0, 0), new Vector(0, 0, 0)),
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

interface PlayerActor {
    update(game: Game): PlayerAction[];
}

type PlayerAction = { type: "move"; to: Position; energy: number } | { type: "hit"; force: Vector };

class AutoPlayerActor implements PlayerActor {
    constructor(private playerId: "a" | "b") {}

    update(game: Game): PlayerAction[] {
        switch (game.point.type) {
            case "toServe":
                const playerIdToServe = game.point.playerId;

                if (playerIdToServe === this.playerId) {
                    return [{ type: "hit", force: new Vector(0, 1, 1) }];
                } else {
                    return [];
                }
            case "playing":
                return [];
        }
    }
}

/* Game */

type Court = {
    length: number;
    width: number;
    netHeight: number;
};

type GameProps = {
    court: Court;
};

type GameState = {
    timestamp: number;
    result: MatchResult;
    ball: Ball;
    players: { a: Player; b: Player };
    actors: { a: PlayerActor; b: PlayerActor };
};

const cm = (x: number) => x / 100;

type SetResult = { a: number; b: number };
type Point = 0 | 15 | 30 | 40 | "advantage";

type MatchResult_ = {
    finishedSets: SetResult[];
    currentSet: SetResult;
    currentGame: { a: Point; b: Point };
    currrentServe: 1 | 2;
    point: { type: "toServe"; playerId: "a" | "b" } | { type: "playing" };
};

class MatchResult {
    constructor(public state: MatchResult_) {}

    static initial(): MatchResult {
        return new MatchResult({
            finishedSets: [],
            currentSet: { a: 0, b: 0 },
            currentGame: { a: 0, b: 0 },
            currrentServe: 1,
            point: { type: "toServe", playerId: "a" },
        });
    }

    served(result: "fault" | "net" | "in"): MatchResult {
        return this;
    }

    pointWonBy(player: "a" | "b"): MatchResult {
        return this;
    }
}

export class Game {
    constructor(private props: GameProps, private state: GameState) {}

    get ball(): Ball {
        return this.state.ball;
    }

    get court(): Court {
        return this.props.court;
    }

    get point(): MatchResult_["point"] {
        return this.state.result.state.point;
    }

    static create(): Game {
        const players = {
            a: Player.create({ name: "Player A" }),
            b: Player.create({ name: "Player B" }),
        };

        const playerActors = {
            a: new AutoPlayerActor("a"),
            b: new AutoPlayerActor("b"),
        };

        return new Game(
            {
                court: {
                    length: 10,
                    width: 5,
                    netHeight: 1.2,
                },
            },
            {
                timestamp: 0,
                ball: Ball.create({ radius: cm(10) }),
                players: players,
                actors: playerActors,
                result: MatchResult.initial(),
            }
        );
    }

    update(tick: number): Game {
        const actions = this.state.actors.a.update(this);
        console.log({ actions });

        return new Game(this.props, {
            ...this.state,
            timestamp: this.state.timestamp + tick,
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
            playerA: this.state.players.a,
            playerB: this.state.players.b,
        };
    }
}
