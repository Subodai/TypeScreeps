import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

export class Refiller {
    // when to renew
    public static ticksBeforeRenew: number = 100;
    // role name
    public static roleName: string = "Refiller";
    // Roster
    public static roster: number[] = [
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1
    ];
    // Roster
    public static rosterLinks: number[] = [
        0,
        0,
        0,
        0,
        1,
        2,
        2,
        2,
        1
    ];
    // Body Structure
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        [],
        [],
        [],
        BodyBuilder({ CARRY: 5, MOVE: 5}),
        BodyBuilder({ CARRY: 10, MOVE: 10 }),
        BodyBuilder({ CARRY: 10, MOVE: 10 }),
        BodyBuilder({ CARRY: 25, MOVE: 25 }),
        BodyBuilder({ CARRY: 25, MOVE: 25 })
    ];

    /**
     * Refillers are only enabled at RCL4+ with storage
     * @param room
     */
    public static enabled(room: Room): boolean {
        // check for controller
        if (room.controller) {
            // check for level >= 4 and has storage
            if (room.controller.level >= 4 && room.storage) {
                return true;
            }
        }
        return false;
    }

    public static run(creep: Creep): void {
        // if creep is tired, don't waste intents
        if (creep.isTired()) {
            creep.log("Tired");
            return;
        }
        // if creep is dying make sure it get's renewed
        creep.deathCheck(this.ticksBeforeRenew);
        // run as normal
        switch (creep.state) {
            // SPAWN state
            case STATE._SPAWN:
                creep.log("In Spawn state");
                if (!creep.isTired()) {
                    creep.log("Done spawning, transitioning to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;

        }
    }
}
