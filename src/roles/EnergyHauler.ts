import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

export class EnergyHauler {
    public static ticksBeforeRenew: number = 100;
    public static color: string = "#006600";
    public static roleName: string = "EHaul";
    private static multiplier: number = 2;
    public static roster: number[] = [ 0, 0, 0, 3, 3, 3, 3, 4, 3 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ CARRY: 2, MOVE: 2}),
        BodyBuilder({ CARRY: 3, MOVE: 3 }),
        BodyBuilder({ CARRY: 5, MOVE: 5 }),
        BodyBuilder({ CARRY: 10, MOVE: 10 }),
        BodyBuilder({ CARRY: 10, MOVE: 10 }),
        BodyBuilder({ CARRY: 10, MOVE: 10 }),
        BodyBuilder({ CARRY: 20, MOVE: 20 }),
        BodyBuilder({ CARRY: 20, MOVE: 20 })
    ];

    public static enabled(room: Room): boolean {
        if (room.memory.charging === false) {
            return false;
        }
        return false;
    }
}
