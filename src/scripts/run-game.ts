import * as readline from "readline";

import { Formatter, FracturedJsonOptions } from "fracturedjsonjs";

import { Game } from "../domain/entities";

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
