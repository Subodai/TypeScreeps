import { Debug } from "functions/debug";
import "./creep";
import { loadRoomPrototypes } from "./room";
import { loadRoomPositionPrototypes } from "./roomPosition";
import { loadSourcePrototypes } from "./sources";
import { loadStructurePrototypes } from "./structure";
import "./structuretower";

export function loadPrototypes(): void {
    Debug.Load("Prototype: Start[" + Game.cpu.getUsed() + "]");
    loadRoomPrototypes();
    loadRoomPositionPrototypes();
    loadStructurePrototypes();
    loadSourcePrototypes();
    Debug.Load("Prototype: Complete[" + Game.cpu.getUsed() + "]");
}
