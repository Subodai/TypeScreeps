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
        return;
    }
}
