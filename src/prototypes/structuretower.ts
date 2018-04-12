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

StructureTower.prototype.run = function(): number {
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

    // always return the CPU used
    return this.countCPU(start);
};

StructureTower.prototype.attackEnemies = function(): boolean {
    const hostile: Creep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
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
    const injured: Creep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: (c: Creep) => c.hits < c.hitsMax
    });
    if (!injured) {
        return false;
    }
    this.heal(injured);
    return true;
};

StructureTower.prototype.healFriendlyCreeps = function(): boolean {
    const friend: Creep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
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
    const values: number[] = [
        1,
        max / 10,
        max / 5,
        max / 4,
        max / 3,
        max / 2,
        max
    ];
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
    // Find a rampart with hp <= the number (hp 1 will always need a blap)
    const rampart: AnyStructure | undefined = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (s) => {
            return s.structureType === STRUCTURE_RAMPART && s.hits <= hp && s.my;
        }
    });
    if (rampart instanceof StructureRampart) {
        // send it back
        return rampart;
    }
};

StructureTower.prototype.repairWalls = function(max?: number): boolean {
    if (max === undefined) {
        max = 100000;
    }
    const values: number[] = [
        1,
        max / 20,
        max / 10,
        max / 5,
        max / 4,
        max / 3,
        max / 2,
        max
    ];
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
    // Find a rampart with hp <= the number (hp 1 will always need a blap)
    const wall: AnyStructure | undefined = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (s) => {
            return s.structureType === STRUCTURE_WALL && s.hits <= hp;
        }
    });
    if (wall instanceof StructureWall) {
        // send it back
        return wall;
    }
};
