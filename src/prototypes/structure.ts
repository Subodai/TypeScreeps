import { Debug } from "functions/debug";

export function loadStructurePrototypes(): void {
    // Debug
    Debug.Load("Prototype: Structure");

    if (!Memory.structures) {
        Debug.Memory("Initialising Structure Memory");
        Memory.structures = {};
    }

    // Adds structure memory to OwnedStructure things.
    // Easier to reason about garbage collection in this implementation.
    Object.defineProperty(OwnedStructure.prototype, "memory", {
        configurable: true,
        enumerable: false,
        get(): any {
            this.initMemory();
            return Memory.structures[this.id];
        },
        set(v: any): any {
            return _.set(Memory, "structures." + this.id, v);
        }
    });

    OwnedStructure.prototype.initMemory = function(): void {
        if (!Memory.structures) { Memory.structures = {}; }
        if (!Memory.structures[this.id]) { Memory.structures[this.id] = {}; }
    };
}

import "./structureLab";
import "./structureLink";
import "./structureSpawn";
import "./structureTower";
