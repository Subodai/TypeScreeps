import { ALLIES } from "config/diplomacy";
import { Debug } from "functions/debug";

Debug.Load("Prototype: StructureTower");

StructureTower.prototype.log = function(msg: string): void {
    Debug.Tower(msg, this);
};

// tslint:disable-next-line:only-arrow-functions
StructureTower.prototype.countCPU = function(start: number): number {
    return Game.cpu.getUsed() - start;
};

StructureTower.prototype.run = function(): number | boolean {
    // Get opening CPU
    const start = Game.cpu.getUsed();
    // if we have less than 10 energy, just don't bother
    if (this.energy < 10) {
        // just return our CPU count (better be low)
        return this.countCPU(start);
    }

    // priority 1, attack the enemies!
    if (this.attackEnemies()) {
        return this.countCPU(start);
    }

    // priority 2, heal my creeps
    if (this.healMyCreeps()) {
        return this.countCPU(start);
    }

    // priority 3, heal friendly creeps
    if (this.healFriendlyCreeps()) {
        return this.countCPU(start);
    }

    // priority 4, repair ramparts and walls with hp of 1
    if (this.energy >= 100 && (this.repairRamparts(1) || this.repairWalls(1))) {
        return this.countCPU(start);
    }

    // priority 5, roads
    if (this.energy >= 400 && this.repairRoads()) {
        return this.countCPU(start);
    }

    // priority 6, rapair ramparts walls and containers
    if (global.towerRepair &&
        this.energy >= 600 &&
        this.room.storage &&
        this.room.storage.store[RESOURCE_ENERGY] >= 200000  &&
        (
            this.repairRamparts(global.rampartMax) ||
            this.repairWalls(global.wallMax) ||
            this.repairContainers()
        )
    ) {
        return false;
    }
    return false;
};

StructureTower.prototype.attackEnemies = function(): boolean {
    const hostile: Creep | null = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (c: Creep) => !(ALLIES.indexOf(c.owner.username) > -1)
    });
    if (!hostile) {
        return false;
    }
    // @Todo do some targetting cleverness?
    this.log("Found Hostile Creep Owned by " + hostile.owner.username);
    if (hostile.owner.username !== "Invader") {
        Game.notify(Game.time + " Tower " + this.id + " Attacking " +
        hostile.owner.username + "'s creep in" + this.room.name);
    }
    this.attack(hostile);
    return true;
};

StructureTower.prototype.healMyCreeps = function(): boolean {
    const injured: Creep | null = this.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: (c: Creep) => c.hits < c.hitsMax
    });
    if (!injured) {
        return false;
    }
    this.heal(injured);
    return true;
};

StructureTower.prototype.healFriendlyCreeps = function(): boolean {
    const friend: Creep | null = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (c: Creep) => ALLIES.indexOf(c.owner.username) > -1 && c.hits < c.hitsMax
    });
    if (!friend) {
        return false;
    }
    this.heal(friend);
    return true;
};

StructureTower.prototype.repairRamparts = function(max?: number): boolean {
    if (max === undefined) {
        max = 10000;
    }
    let values: number[] = [1];
    if (max > 1) {
        values = [
            1,
            300,
            max / 10,
            max / 5,
            max / 4,
            max / 3,
            max / 2,
            max
        ];
    }

    for (const hp of values) {
        const target = this.findRampart(hp);
        if (target) {
            this.log("Found rampart target with hp <= " + hp);
            this.repair(target);
            return true;
        }
    }
    return false;
};

StructureTower.prototype.findRampart = function(hp: number): StructureRampart | void {
    let targets = [];
    targets = this.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_RAMPART && s.hits <= hp && s.my
    });
    if (targets.length > 0) {
        const rampart = _.min(targets, (t) => t.hits);
        if (rampart instanceof StructureRampart) {
            return rampart;
        }
    }
    // // Find a rampart with hp <= the number (hp 1 will always need a blap)
    // const rampart: AnyStructure | undefined = this.pos.findClosestByRange(FIND_STRUCTURES, {
    //     filter: (s) => {
    //         return s.structureType === STRUCTURE_RAMPART && s.hits <= hp && s.my;
    //     }
    // });
    // if (rampart instanceof StructureRampart) {
    //     // send it back
    //     return rampart;
    // }
};

StructureTower.prototype.repairWalls = function(max?: number): boolean {
    if (max === undefined) {
        max = 100000;
    }
    let values: number[] = [1];
    if (max > 1) {
        values = [
            1,
            max / 10,
            max / 5,
            max / 4,
            max / 3,
            max / 2,
            max
        ];
    }
    for (const hp of values) {
        const target = this.findWall(hp);
        if (target) {
            this.log("Found wall target with hp <= " + hp);
            this.repair(target);
            return true;
        }
    }
    return false;
};

StructureTower.prototype.findWall = function(hp: number): StructureWall | void {
    let targets = [];
    targets = this.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_WALL && s.hits <= hp
    });
    if (targets.length > 0) {
        const wall = _.min(targets, (t) => t.hits);
        if (wall instanceof StructureWall) {
            return wall;
        }
    }
    // // Find a rampart with hp <= the number (hp 1 will always need a blap)
    // const wall: AnyStructure | undefined = this.pos.findClosestByRange(FIND_STRUCTURES, {
    //     filter: (s) => {
    //         return s.structureType === STRUCTURE_WALL && s.hits <= hp;
    //     }
    // });
    // if (wall instanceof StructureWall) {
    //     // send it back
    //     return wall;
    // }
};

StructureTower.prototype.repairContainers = function(): boolean {
    const target = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.hits < s.hitsMax
    });
    if (target) {
        this.log("Found Container with hp <= max");
        this.repair(target);
        return true;
    }
    return false;
};

StructureTower.prototype.repairRoads = function(): boolean {
    const target = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax
    });
    if (target) {
        this.log("Found Road with hp <= max");
        this.repair(target);
        return true;
    }
    return false;
};
