import { BodyBuilder } from "functions/tools";

/**
 * Super Upgrader
 */
export class Supergrader {
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#ff6600";
    public static roleName: string = "sUpgrade";
    public static roster: number[]      = [ 0, 4, 8, 8, 6, 3, 2, 2, 1 ];
    public static rosterLinks: number[] = [ 0, 4, 8, 8, 6, 3, 8, 4, 1 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ WORK: 2, CARRY: 1, MOVE: 1 }),
        BodyBuilder({ WORK: 3, CARRY: 2, MOVE: 3 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 6, CARRY: 2, MOVE: 5 }),
        BodyBuilder({ WORK: 6, CARRY: 2, MOVE: 8 }),
        BodyBuilder({ WORK: 6, CARRY: 2, MOVE: 8 }),
        BodyBuilder({ WORK: 6, CARRY: 2, MOVE: 8 }),
        BodyBuilder({ WORK: 1, CARRY: 1, MOVE: 2 })
    ];
    public static bodyStructureLinks: BodyPartConstant[][] = [
        [],
        BodyBuilder({ WORK: 2, CARRY: 1, MOVE: 1 }),
        BodyBuilder({ WORK: 3, CARRY: 2, MOVE: 3 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 6, CARRY: 3, MOVE: 5 }),
        BodyBuilder({ WORK: 10, CARRY: 2, MOVE: 4 }),
        BodyBuilder({ WORK: 15, CARRY: 9, MOVE: 5 }),
        BodyBuilder({ WORK: 30, CARRY: 9, MOVE: 5 }),
        BodyBuilder({ WORK: 15, CARRY: 9, MOVE: 5 })
    ];

    /**
     * Supergraders are enabled in rooms with storage
     * that are above RCL 3
     * and are not charging
     * @param room {Room}
     * @returns {boolean}
     */
    public static enabled(room: Room): boolean {
        if (!room.storage) { return false; }
        if (room.controller && room.controller.level <= 3) { return false; }
        if (room.memory.charging) { return false; }
        return true;
    }

    public static run(creep: Creep): void {
        creep.log("Supergrader?");
        return;
    }
}
