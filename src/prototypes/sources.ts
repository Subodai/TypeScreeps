import { Debug } from "functions/debug";

export function loadSourcePrototypes(): void {
    // Debug
    Debug.Load("Prototype: Source");

    if (!Memory.sources) {
        Debug.Memory("Initialising Source Memory");
        Memory.sources = {};
    }

    Object.defineProperty(Source.prototype, "memory", {
        configurable: true,
        enumerable: false,
        get(): any {
            if (!Memory.rooms[this.room.name].sources) {
                Memory.rooms[this.room.name].sources = {};
            }
            if (!Memory.rooms[this.room.name].sources[this.id]) {
                Memory.rooms[this.room.name].sources[this.id] = {};
            }
            return Memory.rooms[this.room.name].sources[this.id];
        },
        set(v: any): any {
            return _.set(Memory, "sources." + this.room.name + ".sources." + this.id, v);
        }
    });
}
