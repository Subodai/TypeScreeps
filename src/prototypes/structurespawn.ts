import { Debug } from "functions/debug";

Debug.Load("Prototype: StructureSpawn");

/**
 * Log Handler
 */
StructureSpawn.prototype.log = function(msg: string): void {
    Debug.Spawn(msg, this);
};
