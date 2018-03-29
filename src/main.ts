/* Empire Initiations */
import { init } from "config/init";

/* Function Imports */
import { Cleaner } from "./functions/cleaner";
import { Counter } from "./functions/counter";
import { Debug, debugEnablers } from "./functions/debug";
import { Spawner } from "./functions/spawner";

/* Prototype imports */
import { loadPrototypes } from "./prototypes/all";

/* load error mapper */
import { ErrorMapper } from "./utils/ErrorMapper";

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
    Counter.run();
    Counter.setupRoolRoles();
    Spawner.run();
});
