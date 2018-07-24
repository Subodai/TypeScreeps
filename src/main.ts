/* Empire Initiations */
import { init } from "config/init";

/* Function Imports */
import { Cleaner } from "functions/cleaner";
import { Counter } from "functions/counter";
import { Debug, debugEnablers } from "functions/debug";
import { Empire } from "functions/Empire";
import { Runner } from "functions/runner";
import { Science } from "functions/science/Science";
import { Spawner } from "functions/spawner";
import "functions/tools";

/* Prototype imports */
import { loadPrototypes } from "./prototypes/all";

/* load error mapper */
import { ErrorMapper } from "./utils/ErrorMapper";

/* Screepsplus */
import { Screepsplus } from "./utils/Screepsplus/Screepsplus";

import Profiler from "screeps-profiler";

/* Prototype loader */
loadPrototypes();
init();
debugEnablers();
// Profiler.enable();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    // Profiler.wrap(() => {
        if (Game.cpu.bucket < 500) { throw new Error("Super Low Bucket, Recovery Mode Activated"); }
        if (!global.born) {
            global.born = Game.time;
        }

        global.feedEnabled = Memory.feedEnabled;

        // if (Game.time % 10 === 0) {
        //     if (global.feedEnabled) {
        //         Counter.runRoomFeed();
        //     } else {
        //         Counter.clearRoomFeed();
        //     }
        // }

        // Debug start of tick
        Debug.Log(`Current game tick is ${Game.time}: Age:${Game.time - global.born}`);
        // Run Cleaner First
        Cleaner.run();
        Counter.run(); // @todo make the counter count the things we need to run other things
        Spawner.run(); // @todo make this put items into the spawn queue
        Runner.run();  // @todo make this aware of the things the counter has counted so it won't run unnecessary items
        const science = new Science();
        global.science = science;

        const empire = new Empire();
        global.empire = empire;
        if (Game.time % 20 === 0) {
            empire.run();
        }
        const message = Screepsplus.run(); // Collect Stats
        Debug.Log(message);
    // });
});
