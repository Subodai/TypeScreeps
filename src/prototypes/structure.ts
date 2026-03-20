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
            Memory.structures[this.id] = v;
            return v;
        }
    });

    OwnedStructure.prototype.initMemory = function(): void {
        if (!Memory.structures) { Memory.structures = {}; }
        if (!Memory.structures[this.id]) { Memory.structures[this.id] = {}; }
    };

    Object.defineProperty(OwnedStructure.prototype, "targetted", {
        configurable: true,
        enumerable: true,
        get(): number {
            this.initMemory();
            return this.memory.targetted || 0;
        },
        set(v: number): number {
            Memory.structures[this.id].targetted = v;
            return v;
        }
    });
}

import "./structureLab";
import "./structurelink";
import "./structurespawn";
import "./structuretower";
