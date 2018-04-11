import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Harvesters collect energy in a room and bring it back to the base
 */
export class Harvester {
    public static ticksBeforeRenew: number = 100;
    /**
     * Colour for visuals
     */
    public static colour: string = "#ffff00";
    /**
     * The role's identifier
     */
    public static roleName: string = "Harvester";

    /**
     * Multiplier used by this role
     */
    private static multiplier: number = 2;

    /**
     * How many of this role to spawn at each RCL
     */
    public static roster: number[] = [ 0, 4, 3, 2, 2, 2, 2, 2, 2 ];

    /**
     * The body make up of the creep at each RCL
     */
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ WORK: 1, CARRY: 2, MOVE: 2 }),
        BodyBuilder({ WORK: 1, CARRY: 3, MOVE: 4 }),
        BodyBuilder({ CARRY: 5, MOVE: 5 }),
        BodyBuilder({ CARRY: 13, MOVE: 13 }),
        BodyBuilder({ CARRY: 18, MOVE: 18 }),
        BodyBuilder({ CARRY: 18, MOVE: 18 }),
        BodyBuilder({ CARRY: 18, MOVE: 18 }),
        BodyBuilder({ CARRY: 18, MOVE: 18 })
    ];

    /**
     * Is the Harvester role enabled for a room?
     * @param room {Room}
     */
    public static enabled(room: Room): boolean {
        if (room.controller && room.memory.minersNeeded && room.memory.minersNeeded > 0) {
            const list = room.activeCreepsInRole(this);
            if (list.length < room.memory.minersNeeded * this.multiplier) {
                return true;
            }
        }
        return false;
    }

    /**
     * Runtime script for Harvester creep
     * @param creep {Creep}
     */
    public static run(creep: Creep): void {
        // if creep is tired don't waste intents
        if (creep.isTired()) {
            creep.log("Tired");
            return;
        }
        // if creep is dying make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        // run as normal
        switch (creep.state) {
            case STATE._SPAWN:
                creep.log("In spawn state");
                if (!creep.isTired()) {
                    creep.log("Done spawning setting to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            // fall through
            case STATE._INIT:
                creep.log("Initiating Harvester");
                if (creep.atHome()) {
                    creep.log("at home ready to collect");
                    creep.state = STATE._GATHER;
                    this.run(creep);
                }
                break;
            // GATHER state
            case STATE._GATHER:
                creep.log("In gather state");
                if (creep.getNearbyEnergy() === ERR_FULL) {
                    creep.log("Got some energy");
                    creep.state = STATE._DELIVER;
                    this.run(creep);
                }
                break;
            // DELIVER state
            case STATE._DELIVER:
                creep.log("Delivering energy");
                if (creep.empty()) {
                    creep.state = STATE._INIT;
                    // this.run(creep);
                }
                if (creep.deliverEnergy() === OK) {
                    creep.log("Delivered some energy");
                }
                break;
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                break;
        }
    }
}
