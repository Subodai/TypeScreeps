import { Debug } from "functions/debug";
import { loadCreepPrototypes } from "./creep";
import { loadRoomPrototypes } from "./room";
import { loadRoomPositionPrototypes } from "./roomPosition";
import { loadSourcePrototypes } from "./sources";
import { loadStructurePrototypes } from "./structure";

export function loadPrototypes(): void {
    Debug.Load("Prototype: Start[" + Game.cpu.getUsed() + "]");
    loadCreepPrototypes();
    loadRoomPrototypes();
    loadRoomPositionPrototypes();
    loadStructurePrototypes();
    loadSourcePrototypes();
    Debug.Load("Prototype: Complete[" + Game.cpu.getUsed() + "]");
}
