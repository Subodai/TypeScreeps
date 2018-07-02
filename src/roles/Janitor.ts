import * as STATE from "config/states";
import { BodyBuilder, percentToColour } from "functions/tools";

/**
 * Wall and Rampart Builder
 */
export class Janitor {
    public static ticksBeforeRenew: number = 150;
    public static colour: string = "#006699";
    public static roleName: string = "janitor";
    public static roster: number[] = [ 0, 0, 0, 0, 0, 0, 0, 1, 1 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [], [], [], [], [], [], [],
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
        if (room.controller) {
            room.log("Room has controller");
            if (room.controller.level >= 7 && room.storage) {
                room.log("Room is of sufficient level and has storage");
                // @todo move to own method
                // get all walls and ramparts below their max hp
                const items: Structure[] = room.find(FIND_STRUCTURES, {
                    filter: (s: AnyStructure) =>
                        // ramparts below max
                        (s.structureType === STRUCTURE_RAMPART && s.hits < global.rampartMax) ||
                        // walls below max
                        (s.structureType === STRUCTURE_WALL && s.hits < global.wallMax) ||
                        // anything else
                        (
                            // not a wall, rampart or road
                            (
                                s.structureType !== STRUCTURE_WALL &&
                                s.structureType !== STRUCTURE_RAMPART &&
                                s.structureType !== STRUCTURE_ROAD
                            ) &&
                            // with less than 100% hp
                            s.hits < s.hitsMax
                        )
                });
                if (items.length > 0) {
                    room.log("Items found to repair");
                    return true;
                }
            }
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
            return;
        }
        // Death Check
        creep.deathCheck(this.ticksBeforeRenew);
        // Run through our switch statement
        switch (creep.state) {
            // SPAWN state
            case STATE._SPAWN:
                creep.log("In Spawn State");
                if (!creep.isTired()) {
                    creep.log("Done Spawning, transitioning to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            // INIT state
            case STATE._INIT:
                creep.log("Initiating Janitor");
                // Make sure we're in our home room
                if (creep.atHome()) {
                    creep.log("At home ready to gather");
                    creep.state = STATE._GATHER;
                    this.run(creep);
                }
                break;
            // GATHER state
            case STATE._GATHER:
                creep.log("In gather state");
                if (creep.getNearbyEnergy(true) === ERR_FULL) {
                    creep.log("Got some energy");
                    creep.state = STATE._CHARGE;
                    this.run(creep);
                }
                break;
            // CHARGE state
            case STATE._CHARGE:
                creep.log("In Charge state");
                const result = creep.repairStructures(false, true, false);

                if (result === ERR_NOT_IN_RANGE) {
                    creep.log("Moved closer to target");
                }

                // Okay
                if (result === OK) {
                    creep.log("Repaired target");
                }

                // When out of energy
                if (result === ERR_NOT_ENOUGH_ENERGY) {
                    creep.log("Ran out of energy");
                    creep.state = STATE._GATHER;
                    this.run(creep);
                }

                // Invalid target
                if (result === ERR_INVALID_TARGET) {
                    creep.log("Nothing to repair");
                }

                break;
        }
    }
}
