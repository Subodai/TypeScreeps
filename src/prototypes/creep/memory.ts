import * as STATE from "config/states";
/**
 * Load Creep Properties
 */

/**
 * The role of the creep
 */
Object.defineProperty(Creep.prototype, "role", {
    configurable: true,
    enumerable: true,
    get(): string {
        if (!Memory.creeps[this.name]) {
            Memory.creeps[this.name] = {
                role: "Unknown",
                state: "init",
                level: 0, boosted:
                false
            };
            console.log(this.name + " No memory");
        }
        if (!Memory.creeps[this.name].role) {
            Memory.creeps[this.name].role = "Unknown";
        }
        return Memory.creeps[this.name].role;
    },
    set(v: string): string {
        return _.set(Memory, "creeps." + this.name + ".role", v);
    }
});

/**
 * The current State of the creep
 */
Object.defineProperty(Creep.prototype, "state", {
    configurable: true,
    enumerable: true,
    get(): CreepState {
        if (!Memory.creeps[this.name].state) {
            Memory.creeps[this.name].state = STATE._SPAWN;
        }
        return Memory.creeps[this.name].state;
    },
    set(v: CreepState): CreepState {
        return _.set(Memory, "creeps." + this.name + ".state", v);
    }
});

Object.defineProperty(Creep.prototype, "threat", {
    configurable: true,
    enumerable: true,
    get(): number {
        if (!Memory.rooms[this.room.name]) {
            Memory.rooms[this.room.name] = {};
        }
        if (!Memory.rooms[this.room.name].enemies) {
            Memory.rooms[this.room.name].enemies = [];
        }
        if (!Memory.rooms[this.room.name].enemies![this.id]) {
            Memory.rooms[this.room.name].enemies![this.id] = {};
        }
        if (!Memory.rooms[this.room.name].enemies![this.id].threat) {
            Memory.rooms[this.room.name].enemies![this.id].threat = null;
        }
        return Memory.rooms[this.room.name].enemies![this.id].threat;
    },
    set(v: number) {
        return _.set(Memory, "rooms." + this.room.name + ".enemies." + this.id + ".threat", v);
    }
});

/**
 * Boosted flag
 */
Object.defineProperty(Creep.prototype, "boosted", {
    configurable: true,
    enumerable: true,
    get(): boolean {
        return Memory.creeps[this.name].boosted ? Memory.creeps[this.name].boosted : false;
    },
    set(v: boolean): boolean {
        return _.set(Memory, "creeps." + this.name + ".boosted", v);
    }
});
