import { BodyBuilder } from "functions/tools";

/**
 * Miners go to sources in a room and mine them
 */
export class Miner {

    public static roleName: string = "Miner";

    public static roster: number[] = [
        0,
        2,
        2,
        2,
        2,
        2,
        2,
        2,
        2
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

    public static enabled(room: Room): boolean {
        return true;
    }

    public static run(creep: Creep): void {
        return;
    }
}
