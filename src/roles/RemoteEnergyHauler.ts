import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Remote room energy hauler
 */
export class RemoteEnergyHauler {
    public static ticksBeforeRenew: number = 100;
    public static color: string = "#006600";
    public static roleName: string = "rEHaul";
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
            // SPAWN state
            case STATE._SPAWN:
                creep.log("In spawn state");
                // If we haven't saved our _home room
                if (!creep.memory._home) {
                    // set it
                    creep.memory._home = creep.room.name;
                }
                if (!creep.isTired()) {
                    creep.log("Done spawning setting to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            // INIT state
            case STATE._INIT:
                creep.log("Initiating Remote Energy Hauler");
                // Make sure we can actually carry stuff first
                if (!creep.canDo(CARRY)) {
                    creep.log("Damaged seeking repair");
                    return;
                }
                // Pick remote room to go to
                // go into move state
                break;
            // MOVE State
            case STATE._MOVE:
                // Go to remote room
                // set to arrived state once there
                break;
            // GATHER State
            case STATE._GATHER:
                // In remote room, gather resources
                // set to return state
                break;
            // RETURN State
            case STATE._RETURN:
                // Returning to deliver room (home or otherwise)
                // set to DELIVER state
                break;
            // DELIVER State


        }
    }
}
