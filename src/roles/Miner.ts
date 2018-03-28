export class Miner {

    public static roleName: string = "Miner";

    public static roster = {
        1: 2,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 2,
        7: 2,
        8: 2
    };

    public static bodyStructure = {
        1: [WORK, WORK, WORK, MOVE],
        2: [WORK, WORK, WORK, WORK, WORK, MOVE],
        3: [WORK, WORK, WORK, WORK, WORK, MOVE],
        4: [WORK, WORK, WORK, WORK, WORK, MOVE],
        5: [WORK, WORK, WORK, WORK, WORK, MOVE],
        6: [WORK, WORK, WORK, WORK, WORK, MOVE],
        7: [WORK, WORK, WORK, WORK, WORK, MOVE],
        8: [WORK, WORK, WORK, WORK, WORK, MOVE]
    };
}
