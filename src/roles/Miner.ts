import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";
import "prototypes/creep/mineralActions";

/**
 * Miners go to sources in a room and mine them
 */
export class Miner {
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#996600";
    public static roleName: string = "miner";
    public static roster: number[] = [ 0, 4, 4, 4, 4, 4, 4, 4, 4 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ WORK: 3, MOVE: 1 }),
        BodyBuilder({ WORK: 5, MOVE: 1 }),
        BodyBuilder({ WORK: 5, MOVE: 1 }),
        BodyBuilder({ WORK: 5, MOVE: 1 }),
        BodyBuilder({ WORK: 5, MOVE: 1 }),
        BodyBuilder({ WORK: 5, MOVE: 1 }),
        BodyBuilder({ WORK: 5, MOVE: 1 }),
        BodyBuilder({ WORK: 5, MOVE: 1 })
    ];
    // Is this role enabled?
    public static enabled(room: Room): boolean {
        if (room.controller && room.controller.level > 1 && room.memory.minersNeeded && room.memory.minersNeeded > 0) {
            const list = room.activeCreepsInRole(this);
            if (list.length < room.memory.minersNeeded) {
                return true;
            }
        }
        return false;
    }
    // role runner
    public static run(creep: Creep): void {
        // if creep is tired don't waste intents
        if (creep.isTired()) {
            creep.log("Tired");
            return;
        }
        // if creep is dying, make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        // run as normal
        switch (creep.state) {
            // SPAWN state
            case STATE._SPAWN:
                creep.log("In spawn state");
                if (!creep.isTired()) {
                    creep.log("Done spawning, transitioning to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            // INIT state
            case STATE._INIT:
                creep.log("Intitating Miner");
                if (creep.pickSource()) {
                    creep.log("Source Chosen, transitioning to move");
                    creep.state = STATE._MOVE;
                    this.run(creep);
                }
                break;
            // MOVE state
            case STATE._MOVE:
                creep.log("Moving to source");
                if (creep.moveToSource() === OK) {
                    creep.state = STATE._MINE;
                    this.run(creep);
                }
                break;
            // MINE state
            case STATE._MINE:
                creep.log("Mining Source");
                creep.mineSource();
                break;
            // Default catcher
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                this.run(creep);
        }
    }
}

/**
 * Functions required by the miner class of creeps
 */

/**
 * Pick a source to mine in a room
 * @returns {boolean}
 */
Creep.prototype.pickSource = function(): boolean {
    // Does it have a source
    if (this.memory.assignedSource) {
        return true;
    }
    // Make sure the room has cleaned it's sources if necessary
    this.room.sourceSetup();
    // get all the sources in a room
    const sources: Source[] = this.room.find(FIND_SOURCES);
    // get the room's opinion on what is assigned
    // todo move this straight into the source's memory!!???
    const roomSources: { [key: string]: string | null } = this.room.memory.assignedSources!;
    // loop
    for (const i in sources) {
        // get the source
        const source: Source = sources[i];
        // if this item is null in the room's memory
        if (roomSources[source.id] === null) {
            // assign the creep to the source
            this.room.memory.assignedSources![source.id] = this.id;
            // assign the source to the creep
            this.memory.assignedSource = source.id;
            // success!
            return true;
        }
    }
    // could not assign source
    return false;
};

/**
 * Move to the source we have stored in memory
 * @returns {ScreepsReturnCode}
 */
Creep.prototype.moveToSource = function(): ScreepsReturnCode {
    if (this.isTired()) {
        return ERR_TIRED;
    }
    const source: Source | null = Game.getObjectById(this.memory.assignedSource);
    this.log("Attemping to move to source: " + this.memory.assignedSource);
    if (source) {
        if (this.pos.getRangeTo(source.pos) === 1) {
            return OK;
        }
        this.travelTo(source);
        return ERR_NOT_IN_RANGE;
    }
    this.log("Issue with source, resetting memory, and putting in init");
    this.clearTargets();
    this.state = STATE._INIT;
    return ERR_INVALID_TARGET;
};

/**
 * Mine the source we have stored in memory
 * @returns {ScreepsReturnCode}
 */
Creep.prototype.mineSource = function(): ScreepsReturnCode {
    if (!this.memory.dying && this.ticksToLive! <= 150) {
        this.memory.dying = true;
        this.room.memory.assignedSources![this.memory.assignedSource!] = null;
    }
    if (this.memory.assignedSource) {
        const source: Source | null = Game.getObjectById(this.memory.assignedSource);
        if (source) {
            return this.harvest(source);
        }
    }
    this.clearTargets();
    this.state = STATE._INIT;
    return ERR_INVALID_TARGET;
};
