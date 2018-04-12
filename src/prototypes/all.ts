import { Debug } from "functions/debug";
import "./creep";
import { loadRoomPrototypes } from "./room";
import { loadRoomPositionPrototypes } from "./roomPosition";
import { loadSourcePrototypes } from "./sources";
import { loadStructurePrototypes } from "./structure";
import "./structuretower";

export function loadPrototypes(): void {
    const start = Game.cpu.getUsed();
    Debug.Load("Prototype: Start [" + start.toFixed(2) + "]");
    loadRoomPrototypes();
    loadRoomPositionPrototypes();
    loadStructurePrototypes();
    loadSourcePrototypes();
    Debug.Load("Prototype: Complete [" + (Game.cpu.getUsed() - start).toFixed() + "]");
}
