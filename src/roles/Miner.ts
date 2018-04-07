import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Miners go to sources in a room and mine them
 */
export class Miner {

    public static ticksBeforeRenew: number = 100;

    public static roleName: string = "Miner";

    public static roster: number[] = [
        0,
        4,
        4,
        4,
        4,
        4,
        4,
        4,
        4
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

    /**
     * Is this role enabled?
     * @param room {Room}
     */
    public static enabled(room: Room): boolean {
        if (room.controller && room.controller.level > 1 && room.memory.minersNeeded && room.memory.minersNeeded > 0) {
            const list = room.activeCreepsInRole(this);
            if (list.length < room.memory.minersNeeded) {
                return true;
            }
        }
        return false;
    }

    public static run(creep: Creep): void {
        creep.deathCheck(this.ticksBeforeRenew);
        switch (creep.state) {
            // SPAWN state
            case STATE._SPAWN:
                creep.log("In spawn state");
                if (!creep.isTired()) {
                    creep.log("Done spawning, transitioning to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            // INIT state
            case STATE._INIT:
                creep.log("Intitating Miner");
                if (creep.pickSource()) {
                    creep.log("Source Chosen, transitioning to move");
                    creep.state = STATE._MOVE;
                    this.run(creep);
                }
                break;
            // MOVE state
            case STATE._MOVE:
                creep.log("Moving to source");
                if (creep.moveToSource() === OK) {
                    creep.state = STATE._MINE;
                    this.run(creep);
                }
                break;
            // MINE state
            case STATE._MINE:
                creep.log("Mining Source");
                creep.mineSource();
                break;
            // Default catcher
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                this.run(creep);
        }
    }
}
