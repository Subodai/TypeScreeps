import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Remote room reserver
 */
export class RemoteReserver {
    // when to renew
    public static ticksBeforeRenew: number = 100;
    // The colour for visuals
    public static colour: string = "#660066";
    // Rolename
    public static roleName: string = "rReserver";
    // Roster
    public static roster: number[] = [
        0,
        0,
        0,
        0,
        2,
        2,
        2,
        2,
        2
    ];
    // Body structure
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        [],
        [],
        [],
        BodyBuilder({ CLAIM: 2, MOVE: 2}),
        BodyBuilder({ CLAIM: 2, MOVE: 2 }),
        BodyBuilder({ CLAIM: 2, MOVE: 2 }),
        BodyBuilder({ CLAIM: 2, MOVE: 2 }),
        BodyBuilder({ CLAIM: 2, MOVE: 2 })
    ];

    public static enabled(room: Room): boolean {
        // @todo is this check necessary?
        // not enabled for rooms that aren't mine
        if (!room.controller || !room.controller.my) {
            return false;
        }
        // get all reserve flags
        const flags = _.filter(Game.flags, (f) =>
            f.color === global.flagColor.reserve &&
            Game.map.getRoomLinearDistance(room.name, f.pos.roomName) <= 2
        );
        // no flags, no spawns
        if (flags.length === 0) {
            return false;
        }
        for (const i in flags) {
            // grab the flag
            const flag = flags[i];
            const creeps = _.filter(Game.creeps, (c) =>
                c.memory.reserveRoom === flag.pos.roomName &&
                c.memory.flagName === flag.name &&
                !c.memory.dying);
            if (creeps.length === 0) {
                return true;
            }
        }
        // nothing to report return false
        return false;
    }
}
