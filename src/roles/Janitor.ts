import * as STATE from "config/states";
import { BodyBuilder, percentToColour } from "functions/tools";

/**
 * Wall and Rampart Builder
 */
export class Janitor {
    public static ticksBeforeRenew: number = 150;
    public static colour: string = "#006699";
    public static roleName: string = "janitor";
    public static roster: number[] = [ 0, 0, 0, 0, 0, 1, 1, 1, 1 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [], [], [], [], [],
        BodyBuilder({ WORK: 9,  CARRY: 4, MOVE: 13 }),
        BodyBuilder({ WORK: 10, CARRY: 5, MOVE: 15 }),
        BodyBuilder({ WORK: 20, CARRY: 5, MOVE: 25 }),
        BodyBuilder({ WORK: 20, CARRY: 5, MOVE: 25 })
    ];

    /**
     * Is this role enabled
     */
    public static enabled(room: Room): boolean {
        // if tower repair is on, we don't need janitors for walls and ramparts
        if (global.towerRepair) {
            room.log("Tower Repair enabled, so janitor disabled");
            return false;
        }
        if (!room.controller) { return false; }
        room.log("Room has controller");
        if (room.controller.level < 5) { return false; }
        room.log("Room Controller level high enough");
        if (!room.storage) { return false; }
        room.log("Room has storage");
        // @todo move to own method
        // get all walls and ramparts below their max hp
        const items: Structure[] = room.find(FIND_STRUCTURES, {
            filter: (s: AnyStructure) =>
                // ramparts below max * 0.75 (no point spawning all the time to keep going away after)
                (s.structureType === STRUCTURE_RAMPART && s.hits < (global.rampartMax * 0.75)) ||
                // walls below max * 0.9 (no point spawning all the time to keep going away after)
                (s.structureType === STRUCTURE_WALL && s.hits < (global.wallMax * 0.9)) ||
                // Containers only below half health
                (s.structureType === STRUCTURE_CONTAINER && s.hits < (s.hitsMax * 0.5)) ||
                // anything else
                (
                    // not a wall, rampart, conatiner or road
                    (
                        s.structureType !== STRUCTURE_WALL &&
                        s.structureType !== STRUCTURE_RAMPART &&
                        s.structureType !== STRUCTURE_ROAD &&
                        s.structureType !== STRUCTURE_CONTAINER
                    ) &&
                    // with less than 100% hp
                    s.hits < s.hitsMax
                )
        });
        if (items.length > 0) {
            room.log("Items found to repair");
            return true;
        }
        room.log("No items found, Janitors disabled");
        return false;
    }
    /**
     * Runner
     * @param creep
     */
    public static run(creep: Creep): void {
        // Is Creep Tired?
        if (creep.isTired()) {
            creep.log("Tired");
            // return;
        }
        // Death Check
        creep.deathCheck(this.ticksBeforeRenew);
        // Run through our switch statement
        switch (creep.state) {
            // SPAWN state
            case STATE._SPAWN:
                this.runSpawnState(creep);
                break;
            // INIT state
            case STATE._INIT:
                this.runInitState(creep);
                break;
            // GATHER state
            case STATE._GATHER:
                this.runGatherState(creep);
                break;
            // CHARGE state
            case STATE._CHARGE:
                this.runChargeState(creep);
                break;
            // Unknown state
            default:
                creep.state = STATE._INIT;
                break;
        }
    }

    private static runSpawnState(creep: Creep): void {
        creep.log("In Spawn State");
        if (!creep.isTired()) {
            creep.log("Done Spawning, transitioning to init");
            creep.state = STATE._INIT;
            this.run(creep);
        }
    }

    private static runInitState(creep: Creep): void {
        creep.log("Initiating Janitor");
        // Make sure we're in our home room
        if (creep.atHome()) {
            creep.log("At home ready to gather");
            creep.state = STATE._GATHER;
            this.run(creep);
        }
    }

    private static runGatherState(creep: Creep): void {
        creep.log("In gather state");
        if (creep.getNearbyEnergy(true) === ERR_FULL) {
            creep.log("Got some energy");
            creep.state = STATE._CHARGE;
            this.run(creep);
        }
    }

    private static runChargeState(creep: Creep): void {
        creep.log("In Charge state");
        const result = creep.repairStructures(false, true, false);
        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.log("Moved closer to target");
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                creep.log("Ran out of energy");
                creep.state = STATE._GATHER;
                this.run(creep);
                break;
            case ERR_INVALID_TARGET:
                creep.log("Nothing to repair");
                break;
            case OK:
                creep.log("Repaired target");
                break;
            default:
                creep.log("UnHandled Result: " + JSON.stringify(result));
                break;
        }
    }
}
