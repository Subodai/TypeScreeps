import { BodyBuilder } from "functions/tools";

/**
 * Harvesters collect energy in a room and bring it back to the base
 */
export class Harvester {

    public static roleName: string = "Harvester";

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
        BodyBuilder({ WORK: 1, CARRY: 2, MOVE: 2 }),
        BodyBuilder({ WORK: 1, CARRY: 3, MOVE: 4 }),
        BodyBuilder({ CARRY: 5, MOVE: 5 }),
        BodyBuilder({ CARRY: 13, MOVE: 13 }),
        BodyBuilder({ CARRY: 18, MOVE: 18 }),
        BodyBuilder({ CARRY: 18, MOVE: 18 }),
        BodyBuilder({ CARRY: 18, MOVE: 18 }),
        BodyBuilder({ CARRY: 18, MOVE: 18 })
    ];
}
