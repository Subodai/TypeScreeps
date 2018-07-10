/* Empire Initiations */
import { init } from "config/init";

/* Function Imports */
import { Cleaner } from "functions/cleaner";
import { Counter } from "functions/counter";
import { Debug, debugEnablers } from "functions/debug";
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

/* Prototype loader */
loadPrototypes();
init();
debugEnablers();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    if (!global.born) {
        global.born = Game.time;
    }
    global.feedEnabled = Memory.feedEnabled;
    // Debug start of tick
    Debug.Log(`Current game tick is ${Game.time}: Age:${Game.time - global.born}`);
    // Run Cleaner First
    Cleaner.run();
    Counter.run(); // @todo make the counter count the things we need to run other things
    Spawner.run(); // @todo make this put items into the spawn queue
    Runner.run();  // @todo make this aware of the things the counter has counted so it won't run unnecessary items
    const science = new Science();
    global.science = science;
    const message = Screepsplus.run(); // Collect Stats
    Debug.Log(message);
});
