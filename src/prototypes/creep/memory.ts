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
        Memory.creeps[this.name].role = v;
        return v;
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
        Memory.creeps[this.name].state = v;
        return v;
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
        Memory.rooms[this.room.name].enemies![this.id].threat = v;
        return v;
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
        Memory.creeps[this.name].boosted = v;
        return v;
    }
});
