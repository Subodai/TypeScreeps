import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Upgrader
 */
export class Upgrader {
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#009900";
    public static roleName: string = "upgrade";
    public static roster: number[]      = [ 0, 4, 8, 8, 1, 1, 1, 1, 1 ];
    public static rosterLinks: number[] = [ 0, 4, 8, 8, 8, 8, 8, 8, 1 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ WORK: 2, CARRY: 1, MOVE: 1 }),
        BodyBuilder({ WORK: 2, CARRY: 2, MOVE: 4 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 1, CARRY: 1, MOVE: 2 }),
        BodyBuilder({ WORK: 1, CARRY: 1, MOVE: 2 }),
        BodyBuilder({ WORK: 1, CARRY: 1, MOVE: 2 }),
        BodyBuilder({ WORK: 1, CARRY: 1, MOVE: 2 }),
        BodyBuilder({ WORK: 1, CARRY: 1, MOVE: 2 })
    ];
    public static bodyStructureLinks: BodyPartConstant[][] = [
        [],
        BodyBuilder({ WORK: 2, CARRY:   1, MOVE: 1  }),
        BodyBuilder({ WORK: 3, CARRY:   2, MOVE: 3  }),
        BodyBuilder({ WORK: 4, CARRY:   2, MOVE: 6  }),
        BodyBuilder({ WORK: 6, CARRY:   2, MOVE: 5  }),
        BodyBuilder({ WORK: 14, CARRY:  2, MOVE: 6  }),
        BodyBuilder({ WORK: 20, CARRY:  2, MOVE: 4  }),
        BodyBuilder({ WORK: 40, CARRY:  2, MOVE: 8  }),
        BodyBuilder({ WORK: 15, CARRY:  2, MOVE: 8  })
    ];

    /**
     * Upgraders are only enabled when supergraders are not
     * @param room {Room}
     * @returns {boolean}
     */
    public static enabled(room: Room): boolean {
        return true;
    }

    public static run(creep: Creep): void {
        // if creep is dying make sure it get's renewed
        creep.deathCheck(this.ticksBeforeRenew);
        if (creep.room.memory.links) {
            this.colour = "#ff6600";
        } else {
            this.colour = "#009900";
        }
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
            // INIT state
            case STATE._INIT:
                creep.log("Initiating Upgrader");
                creep.log("Changing to gather state");
                creep.state = STATE._GATHER;
                break;
            // GATHER state
            case STATE._GATHER:
                creep.log("In gather state");
                if (_.sum(creep.carry) === creep.carryCapacity || creep.getNearbyEnergy(true) === ERR_FULL) {
                    creep.log("Got some energy");
                    creep.clearTargets();
                    creep.state = STATE._UPGRADE;
                    this.run(creep);
                }
                break;
            // UPGRADE state
            case STATE._UPGRADE:
                creep.log("In upgrade state");
                if (creep.carry.energy === 0) {
                    creep.log("Creep empty going back to init state");
                    creep.clearTargets();
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                // todo Possibly try checking if we will complete
                // action when we have less or equal energy to the amount
                // we're about to use, so queue 2 actions, upgrade and move
                // needs creep.getActiveBodyparts(WORK);
                // try upgrading the controller
                const result = creep.upgradeHomeRoom();
                if (result === OK) {
                    creep.log("Upgraded Controller");
                }
                if (result === ERR_NOT_ENOUGH_RESOURCES) {
                    creep.log("Creep empty going back to init state");
                    creep.clearTargets();
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                this.run(creep);
        }
    }
}

/**
 * Upgrade the creep's homeroom controller
 * @returns {ScreepsReturnCode}
 */
Creep.prototype.upgradeHomeRoom = function(): ScreepsReturnCode {
    if (Game.rooms[this.memory.roomName!]) {
        const controller: StructureController | undefined = Game.rooms[this.memory.roomName!].controller;
        if (controller) {
            // if we're move than 3 spaces away, get close
            if (this.pos.getRangeTo(controller.pos) > 3) {
                this.travelTo(controller);
                return ERR_NOT_IN_RANGE;
            }
            // we must be within 3 spaces
            return this.upgradeController(controller);
        }
    } else {
        // we're not in the right room wtf?! move to it
        const pos = new RoomPosition(25, 25, this.memory.roomName!);
        this.travelTo(pos);
        return ERR_NOT_IN_RANGE;
    }
    // invalid target halp
    this.log("ERROR invalid upgrader target halp");
    return ERR_INVALID_TARGET;
};
