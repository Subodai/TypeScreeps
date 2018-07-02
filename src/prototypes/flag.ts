import { Debug } from "functions/debug";

export function loadFlagPrototypes(): void {
    // Debug
    Debug.Log("Prototype: Flag");

    if (!Memory.flags) {
        Debug.Memory("Initialising Flag Memory");
        Memory.flags = {};
    }

    Object.defineProperty(Flag.prototype, "assignedCreep", {
        configurable: true,
        enumerable: false,
        get(): Creep | null {
            // Does this flag exist in memory yet?
            if (!Memory.flags[this.name]) { Memory.flags[this.name] = {}; }
            // Does it have a set creep? if not return null
            if (!Memory.flags[this.name].assignedCreep) { return null; }
            // get the creep and return it if we have one
            return Game.getObjectById(Memory.flags[this.name].assignedCreep) as Creep;
        },
        set(v: Creep | null): Creep | null {
            if (v === null) {
                delete Memory.flags[this.name].assignedCreep;
                return null;
            }
            _.set(Memory, "flags." + this.name + ".assignedCreep", v.id);
            return Game.getObjectById(v.id) as Creep;
        }
    });
}
