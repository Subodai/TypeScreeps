import * as STATE from "config/states";
/**
 * Load Creep Properties
 */
export function loadCreepProperties(): void {
    /**
     * The role of the creep
     */
    Object.defineProperty(Creep.prototype, "role", {
        configurable: true,
        enumerable: true,
        get(): string {
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
}
