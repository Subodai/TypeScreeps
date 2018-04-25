import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Remote room energy hauler
 */
export class RemoteEnergyHauler {
    // when to renew
    public static ticksBeforeRenew: number = 100;
    // the colour for visuals
    public static color: string = "#006600";
    // the rolename
    public static roleName: string = "rEHaul";
    // multiplier for the number required per flag
    private static multiplier: number = 2;
    // the roster
    public static roster: number[] = [ 0, 0, 0, 3, 3, 3, 3, 4, 3 ];
    // the body construction
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
    // is it enabled
    public static enabled(room: Room): boolean {
        if (room.memory.charging === false) {
            return false;
        }
        const flags = _.filter(Game.flags, (f: Flag) =>
            f.color === global.flagColor.haul &&
            Game.map.getRoomLinearDistance(room.name, f.pos.roomName) <= 2
        );
        if (flags.length === 0) {
            return false;
        }
        return true;
    }

    public static run(creep: Creep): void {
        if (creep.isTired()) {
            creep.log("Tired");
            return;
        }
        // if creep is dying make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        // run state as normal
        switch (creep.state) {
            case STATE._SPAWN:

                break;
        }
    }
}
