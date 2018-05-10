import { Debug } from "functions/debug";

Debug.Log("Prototype: Flag");

Object.defineProperty(Flag.prototype, "assignedCreep", {
    configurable: true,
    enumerable: false,
    get(): Creep | null {
        if (!Memory.flags[this.id].assignedCreep) {
            return null;
        }
        return Game.getObjectById(Memory.flags[this.id].assignedCreep) as Creep;
    },
    set(v: Creep | null): Creep | null {
        if (v === null) {
            delete Memory.flags[this.id].assignedCreep;
            return null;
        }
        return Game.getObjectById(_.set(Memory, "flags." + this.id + ".assignedCreep", v.id)) as Creep;
    }
});
