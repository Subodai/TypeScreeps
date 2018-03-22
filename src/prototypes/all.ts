import { Debug } from "functions/debug";
import { loadCreepPrototypes } from "./creep";
import { loadRoomPrototypes } from "./room";
import { loadRoomPositionPrototypes } from "./roomPosition";
import { loadSourcePrototypes } from "./sources";
import { loadStructurePrototypes } from "./structure";

export function loadPrototypes(): void {
    Debug.Log("Prototype Load Start");
    loadCreepPrototypes();
    loadRoomPrototypes();
    loadRoomPositionPrototypes();
    loadStructurePrototypes();
    loadSourcePrototypes();
    Debug.Log("Prototype Load Complete");
}
