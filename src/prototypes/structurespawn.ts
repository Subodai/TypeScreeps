import { Debug } from "functions/debug";

export function loadStructureSpawnPrototypes(): void {
    Debug.Load("Prototype: StructureSpawn");

    /**
     * Log Handler
     */
    StructureSpawn.prototype.log = function(msg: string): void {
        Debug.Spawn(msg, this);
    };
}
