/* load functions */
import { Debug } from "./functions/debug";

/* load prototypes */
import { loadCreepPrototypes } from "./prototypes/creep";
import { loadRoomPrototypes } from "./prototypes/room";

/* load error mapper */
import { ErrorMapper } from "./utils/ErrorMapper";

loadRoomPrototypes();
loadCreepPrototypes();
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    Debug.DebugMsg(`Current game tick is ${Game.time}`);

    for (const room in Game.rooms) {
        Debug.RoomMsg("Is my room", Game.rooms[room]);
    }
    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
});
