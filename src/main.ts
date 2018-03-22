/* Function Imports */
import { Debug } from "./functions/debug";

/* Prototype imports */
import { loadPrototypes } from "prototypes/all";

/* load error mapper */
import { ErrorMapper } from "./utils/ErrorMapper";

/* Prototype loader */
loadPrototypes();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    if (!global.born) {
        global.born = Game.time;
    }
    Debug.Log(`Current game tick is ${Game.time}: Age:${Game.time - global.born}`);
    for (const room in Game.rooms) {
        Debug.room("Is my room", Game.rooms[room]);
    }
    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
});
