import { Debug } from "functions/debug";
import "./creep";
import { loadFlagPrototypes } from "./flag";
import "./room";
import "./roomPosition";
import { loadSourcePrototypes } from "./sources";
import { loadStructurePrototypes } from "./structure";

export function loadPrototypes(): void {
    const start = Game.cpu.getUsed();
    Debug.Load("Prototype: Start [" + start.toFixed(2) + "]");
    loadStructurePrototypes();
    loadSourcePrototypes();
    loadFlagPrototypes();
    Debug.Load("Prototype: Complete [" + (Game.cpu.getUsed() - start).toFixed() + "]");
}
