import { Debug } from "functions/debug";

/**
 * Load Structure Lab Prototype Extensions
 */
Debug.Log("Prototype: StructureLab");

StructureLab.prototype.log = function(msg: string): void {
    Debug.Lab(msg, this);
};

Object.defineProperty(StructureLab.prototype, "mineralIn", {
    configurable: true,
    enumerable: false,
    get(): MineralConstant | null {
        this.initMemory();
        return Memory.structures[this.id].mineralIn || null;
    },
    set(v: MineralConstant | null): MineralConstant | null {
        return _.set(Memory, "structures." + this.id + ".mineralIn", v);
    }
});

Object.defineProperty(StructureLab.prototype, "compoundIn", {
    configurable: true,
    enumerable: false,
    get(): ResourceConstant | null {
        this.initMemory();
        return Memory.structures[this.id].compoundIn || null;
    },
    set(v: ResourceConstant | null): ResourceConstant | null {
        return _.set(Memory, "structures." + this.id + ".compoundIn", v);
    }
});

Object.defineProperty(StructureLab.prototype, "compoundOut", {
    configurable: true,
    enumerable: false,
    get(): ResourceConstant | null {
        this.initMemory();
        return Memory.structures[this.id].compoundOut || null;
    },
    set(v: ResourceConstant | null): ResourceConstant | null {
        return _.set(Memory, "structures." + this.id + ".compoundOut", v);
    }
});

Object.defineProperty(StructureLab.prototype, "boostTarget", {
    configurable: true,
    enumerable: false,
    get(): BoostTarget | null {
        this.initMemory();
        return Memory.structures[this.id].boostTarget || null;
    },
    set(v: BoostTarget | null): BoostTarget | null {
        return _.set(Memory, "structures." + this.id + ".boostTarget", v);
    }
});
/**
 * Define the labType based on it's position
 */
Object.defineProperty(StructureLab.prototype, "labType", {
    configurable: true,
    enumerable: false,
    get(): any {
        this.initMemory();
        if (!Memory.structures[this.id].labType) {
            const lab: StructureLab = this;
            let type: string = "reactor";
            // if we're within 2 of the terminal, we're a feeder
            if (lab.room.terminal && this.pos.inRangeTo(lab.room.terminal, 2)) {
                type = "feeder";
            }
            const spawns: StructureSpawn[] = lab.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_SPAWN
            }) as StructureSpawn[];

            let booster = false;
            for (const spawn of spawns) {
                if (spawn.pos.getRangeTo(lab) <= 1) {
                    booster = true;
                    break;
                }
            }
            if (booster) {
                type = "booster";
            }
            // Initialise this link
            Memory.structures[this.id].linkType = type;
        }
        return Memory.structures[this.id].linkType;
    },
    set(v: any): any {
        return _.set(Memory, "structures." + this.id + ".labType", v);
    }
});
