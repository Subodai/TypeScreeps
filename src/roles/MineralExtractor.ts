import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";
/**
 * Mineral Extractor
 */
export class MineralExtractor {
    public static ticksBeforeRenew: number = 200;
    public static colour: string = "#663300";
    public static roleName: string = "mMiner";
    public static roster: number[] = [ 0, 0, 0, 0, 0, 0, 8, 8, 8 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        [],
        [],
        [],
        [],
        [],
        BodyBuilder({ WORK: 20, MOVE: 6 }),
        BodyBuilder({ WORK: 45, MOVE: 5 }),
        BodyBuilder({ WORK: 45, MOVE: 5 })
    ];
    // is this role enabled?
    public static enabled(room: Room): boolean {
        // no controller?
        if (!room.controller) {
            return false;
        } else {
            // controller < 6
            if (room.controller.level < 6) {
                return false;
            }
        }
        if (room.memory.mineralsNeeded && room.memory.mineralsNeeded > 0) {
            return true;
        }
        return false;
    }
    // role runner
    public static run(creep: Creep): void {
        // check tired
        if (creep.isTired()) {
            creep.log("Tired");
            return;
        }
        // if creep is dying, make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        // run
        switch (creep.state) {
            // SPAWN state
            case STATE._SPAWN:
                creep.log("In Spawn State");
                if (!creep.isTired()) {
                    creep.log("Done spawning, transitioning to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            // INIT state
            case STATE._INIT:
                creep.log("Initiating Mineral Extractor");
                if (creep.pickMineral()) {
                    creep.log("Mineral Source chosen, transitioning to move");
                    creep.state = STATE._MOVE;
                    this.run(creep);
                }
                break;
            // MOVE state
            case STATE._MOVE:
                creep.log("Moving to minerals");
                if (creep.moveToMineral() === OK) {
                    creep.state = STATE._MINE;
                    this.run(creep);
                }
                break;
            // MINE state
            case STATE._MINE:
                creep.log("Mining mineral");
                if (OK === creep.mineMineral()) {
                    creep.log("Mineral Mined!");
                    creep.memory.sleepUntil = Game.time + 1 + EXTRACTOR_COOLDOWN;
                }
                break;
            // default catcher
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                this.run(creep);
                break;
        }
    }
}

Creep.prototype.pickMineral = function(): boolean {
    // does it have a mineral
    if (this.memory.assignedMineral) {
        return true;
    }
    // Make sure the room has cleaned it's minerals if necessary
    this.room.mineralSetup();
    const minerals = this.room.find(FIND_MINERALS, {
        filter: (i: Mineral) => (
            i.mineralAmount > 0 || i.ticksToRegeneration <= ((50 * 3) + MineralExtractor.ticksBeforeRenew)
        )
    });
    if (minerals.length <= 0) {
        return false;
    }
    const mineral: Mineral = _.first(minerals);
    this.memory.assignedMineral = mineral.id;
    // didn't work
    return true;
};

/**
 * Move to the source we have stored in memory
 * @returns {ScreepsReturnCode}
 */
Creep.prototype.moveToMineral = function(): ScreepsReturnCode {
    if (this.isTired()) {
        return ERR_TIRED;
    }
    const mineral: Mineral | null = Game.getObjectById(this.memory.assignedMineral);
    this.log("Attemping to move to mineral: " + this.memory.assignedMineral);
    if (mineral) {
        this.log("mineral selected, checking range");
        if (this.pos.getRangeTo(mineral.pos) === 1) {
            this.log("mineral in range");
            return OK;
        }
        this.log("mineral not in range");
        this.travelTo(mineral);
        return ERR_NOT_IN_RANGE;
    } else {
        this.log(JSON.stringify(mineral));
    }
    this.log("Issue with mineral, resetting memory, and putting in init");
    this.clearTargets();
    this.state = STATE._INIT;
    return ERR_INVALID_TARGET;
};

Creep.prototype.mineMineral = function(): ScreepsReturnCode {
    if (!this.memory.dying && this.ticksToLive! <= MineralExtractor.ticksBeforeRenew) {
        this.memory.dying = true;
    }
    if (this.memory.assignedMineral) {
        const mineral: Mineral | null = Game.getObjectById(this.memory.assignedMineral);
        if (mineral) {
            return this.harvest(mineral);
        }
    }
    this.clearTargets();
    this.state = STATE._INIT;
    return ERR_INVALID_TARGET;
};
