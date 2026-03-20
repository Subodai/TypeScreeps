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
    get(): MineralConstant | undefined {
        this.initMemory();
        return Memory.structures[this.id].mineralIn || undefined;
    },
    set(v: MineralConstant | undefined): MineralConstant | undefined {
        this.initMemory();
        Memory.structures[this.id].mineralIn = v;
        return v;
    }
});

Object.defineProperty(StructureLab.prototype, "compoundIn", {
    configurable: true,
    enumerable: false,
    get(): ResourceConstant | undefined {
        this.initMemory();
        return Memory.structures[this.id].compoundIn || undefined;
    },
    set(v: ResourceConstant | undefined): ResourceConstant | undefined {
        this.initMemory();
        Memory.structures[this.id].compoundIn = v;
        return v;
    }
});

Object.defineProperty(StructureLab.prototype, "compoundOut", {
    configurable: true,
    enumerable: false,
    get(): ResourceConstant | undefined {
        this.initMemory();
        return Memory.structures[this.id].compoundOut || undefined;
    },
    set(v: ResourceConstant | undefined): ResourceConstant | undefined {
        this.initMemory();
        Memory.structures[this.id].compoundOut = v;
        return v;
    }
});

Object.defineProperty(StructureLab.prototype, "boostTarget", {
    configurable: true,
    enumerable: false,
    get(): BoostTarget | undefined {
        this.initMemory();
        return Memory.structures[this.id].boostTarget || undefined;
    },
    set(v: BoostTarget | undefined): BoostTarget | undefined {
        this.initMemory();
        Memory.structures[this.id].boostTarget = v;
        return v;
    }
});

Object.defineProperty(StructureLab.prototype, "reaction", {
    configurable: true,
    enumerable: false,
    get(): LabReaction | undefined {
        this.initMemory();
        const response = Memory.structures[this.id].reaction || undefined;
        if (response === undefined) {
            return response;
        }
        const reaction: LabReaction = {
            sourceLab1: Game.getObjectById(response.sourceLab1) as StructureLab,
            sourceLab2: Game.getObjectById(response.sourceLab2) as StructureLab,
            targetLab: this
        };
        return reaction;
    },
    set(v: LabReaction | undefined): LabReaction | undefined {
        this.initMemory();
        if (v === undefined) {
            Memory.structures[this.id].reaction = v;
            return v;
        }
        const data = {
            sourceLab1: v.sourceLab1.id,
            sourceLab2: v.sourceLab2.id,
            targetLab: v.targetLab.id
        };
        Memory.structures[this.id].reaction = data;
        return v;
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
            Memory.structures[this.id].labType = type;
        }
        return Memory.structures[this.id].labType;
    },
    set(v: any): any {
        this.initMemory();
        Memory.structures[this.id].labType = v;
        return v;
    }
});

Object.defineProperty(StructureLab.prototype, "emptyMe", {
    configurable: true,
    enumerable: false,
    get(): boolean {
        this.initMemory();
        return Memory.structures[this.id].emptyMe || false;
    },
    set(v: boolean): boolean {
        this.initMemory();
        Memory.structures[this.id].emptyMe = v;
        return v;
    }
});
