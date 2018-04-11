import { ALLIES } from "config/diplomacy";
import { Debug } from "functions/debug";

export function loadTowerPrototypes(): void {
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
}
