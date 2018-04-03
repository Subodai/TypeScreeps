import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Harvesters collect energy in a room and bring it back to the base
 */
export class Harvester {
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
    public static roster: number[] = [ 0, 2, 2, 2, 2, 2, 2, 2, 2 ];

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
     * @param Room {Room}
     */
    public static enabled(Room: Room): boolean {
        if (Room.controller && Room.memory.minersNeeded && Room.memory.minersNeeded > 0) {
            const list = _.filter(Game.creeps, (c) => c.memory.role === this.roleName &&
                                  c.memory.roomName === Room.name && !c.memory.dying);
            if (list.length < Room.memory.minersNeeded * this.multiplier) {
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
                creep.log("In init state");
                if (this.atHome(creep)) {
                    creep.log("at home ready to collect");
                    creep.state = STATE._MOVE;
                    this.run(creep);
                }
                break;
            case STATE._MOVE:
                creep.log("In move state");
                break;
            default:
                creep.log("No state set");
                break;
        }
    }

    /**
     * Is creep in it's home room?
     * @param creep {Creep}
     */
    private static atHome(creep: Creep): boolean {
        if (creep.room.name !== creep.memory.roomName) {
            delete creep.memory.energyPickup;
            if (creep.memory.roomName) {
                const pos = new RoomPosition(25, 25, creep.memory.roomName);
                creep.travelTo(pos);
                return false;
            }
        }
        return true;
    }

    private static checkLoad(creep: Creep): void {
        // check if this creep is full/empty done?
        if (_.sum(creep.carry) === 0) {
            return;
        }
    }
}
