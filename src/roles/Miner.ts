export class Miner {

    public static roleName: string = "Miner";

    public static roster = [
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

    public static bodyStructure = [
        [],
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
