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
        BodyBuilder({ WORK: 2, MOVE: 2 }),
        [WORK, WORK, WORK, MOVE],
        [WORK, WORK, WORK, WORK, WORK, MOVE],
        [WORK, WORK, WORK, WORK, WORK, MOVE],
        [WORK, WORK, WORK, WORK, WORK, MOVE],
        [WORK, WORK, WORK, WORK, WORK, MOVE],
        [WORK, WORK, WORK, WORK, WORK, MOVE],
        [WORK, WORK, WORK, WORK, WORK, MOVE],
        [WORK, WORK, WORK, WORK, WORK, MOVE]
    ];
}
