import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Miners go to sources in a room and mine them
 */
export class Miner extends Role {

    public static roleName: string = "Miner";

    public static roster: number[] = [
        0,
        4,
        4,
        4,
        4,
        4,
        4,
        4,
        4
    ];

    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ WORK: 3, MOVE: 1 }),
        BodyBuilder({ WORK: 5, MOVE: 1 }),
        BodyBuilder({ WORK: 3, MOVE: 1 }),
        BodyBuilder({ WORK: 3, MOVE: 1 }),
        BodyBuilder({ WORK: 3, MOVE: 1 }),
        BodyBuilder({ WORK: 3, MOVE: 1 }),
        BodyBuilder({ WORK: 3, MOVE: 1 }),
        BodyBuilder({ WORK: 3, MOVE: 1 })
    ];

    /**
     * Is this role enabled?
     * @param room {Room}
     */
    public static enabled(room: Room): boolean {
        if (room.controller && room.controller.level > 1 && room.memory.minersNeeded && room.memory.minersNeeded > 0) {
            const list = room.activeCreepsInRole(this);
            if (list.length < room.memory.minersNeeded) {
                return true;
            }
        }
        return false;
    }

    public static run(creep: Creep): void {
        switch (creep.state) {
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
                if (this.pickSource(creep)) {
                    creep.log("Source Chosen, transitioning to move");
                    creep.state = STATE._MOVE;
                    this.run(creep);
                }
                break;
            // MOVE state
            case STATE._MOVE:
                creep.log("Moving to source");
                if (this.moveToSource(creep) === OK) {
                    creep.state = STATE._MINE;
                    this.run(creep);
                }
                break;
            // MINE state
            case STATE._MINE:
                creep.log("Mining Source");
                this.mineSource(creep);
                break;
            // Default catcher
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                this.run(creep);
        }
    }

    /**
     * Pick a source to mine in a room
     * @param creep {Creep}
     * @returns {boolean}
     */
    private static pickSource(creep: Creep): boolean {
        // Does it have a source
        if (creep.memory.assignedSource) {
            return true;
        }
        // Make sure the room has cleaned it's sources if necessary
        creep.room.sourceSetup();
        // get all the sources in a room
        const sources: Source[] = creep.room.find(FIND_SOURCES);
        // get the room's opinion on what is assigned
        // todo move this straight into the source's memory!!???
        const roomSources: {[key: string]: string | null} = creep.room.memory.assignedSources!;
        // loop
        for (const i in sources) {
            // get the source
            const source: Source = sources[i];
            // if this item is null in the room's memory
            if (roomSources[source.id] === null) {
                // assign the creep to the source
                creep.room.memory.assignedSources![source.id] = creep.id;
                // assign the source to the creep
                creep.memory.assignedSource = source.id;
                // success!
                return true;
            }
        }
        // could not assign source
        return false;
    }

    /**
     * Move to the source we have stored in memory
     * @param creep {Creep}
     * @returns {ScreepsReturnCode}
     */
    private static moveToSource(creep: Creep): ScreepsReturnCode {
        if (creep.isTired()) {
            return ERR_TIRED;
        }
        const source: Source | null = Game.getObjectById(creep.memory.assignedSource);
        if (source) {
            if (creep.pos.getRangeTo(source.pos) === 1) {
                return OK;
            }
            // creep.travelTo(source);
            creep.moveTo(source);
            return ERR_NOT_IN_RANGE;
        }
        creep.log("Issue with source, resetting memory, and putting in init");
        creep.clearTargets();
        creep.state = STATE._INIT;
        return ERR_INVALID_TARGET;
    }

    /**
     * Mine the source we have stored in memory
     * @param creep {Creep}
     * @returns {ScreepsReturnCode}
     */
    private static mineSource(creep: Creep): ScreepsReturnCode {
        if (!creep.memory.dying && creep.ticksToLive! <= 150) {
            creep.memory.dying = true;
            creep.room.memory.assignedSources![creep.memory.assignedSource!] = null;
        }
        if (creep.memory.assignedSource) {
            const source: Source | null = Game.getObjectById(creep.memory.assignedSource);
            if (source) {
                return creep.harvest(source);
            }
        }
        creep.clearTargets();
        creep.state = STATE._INIT;
        return ERR_INVALID_TARGET;
    }
}
