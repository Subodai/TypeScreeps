import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Remote room reserver
 */
export class RemoteReserver {
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#660066";
    public static roleName: string = "rRes";
    public static roster: number[] = [ 0, 0, 0, 2, 2, 2, 2, 2, 2 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        [],
        [],
        BodyBuilder({ CLAIM: 2, MOVE: 2 }),
        BodyBuilder({ CLAIM: 2, MOVE: 2 }),
        BodyBuilder({ CLAIM: 2, MOVE: 2 }),
        BodyBuilder({ CLAIM: 2, MOVE: 2 }),
        BodyBuilder({ CLAIM: 2, MOVE: 2 }),
        BodyBuilder({ CLAIM: 2, MOVE: 2 })
    ];
    // is it enabled?
    public static enabled(room: Room): boolean {
        // @todo is this check necessary?
        // not enabled for rooms that aren't mine
        if (!room.controller || !room.controller.my) {
            return false;
        }
        // get all reserve flags
        const flags = _.filter(Game.flags, (f: Flag) =>
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
            const creeps = _.filter(Game.creeps, (c: Creep) =>
                c.memory.role === this.roleName &&
                c.memory.reserveRoom === flag.pos.roomName &&
                c.memory.flagName === flag.name &&
               !c.memory.dying);
            // does this flag have an assigned creep?
            if (creeps.length === 0) {
                // no lets make a new one
                return true;
            }
        }
        // nothing to report return false
        return false;
    }
    // run the creep role
    public static run(creep: Creep): void {
        if (creep.isTired()) {
            creep.log("Tired");
            return;
        }
        // if creep dying make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        // run state
        switch (creep.state) {
            // SPAWN state
            case STATE._SPAWN:
                creep.log("In spawn state");
                if (!creep.isTired()) {
                    creep.log("Done spawning setting to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            // INIT state
            case STATE._INIT:
                creep.log("Initiating Remote Reserver");
                // Make sure we can actually claim
                if (!creep.canDo(CLAIM)) {
                    creep.log("Damaged seeking repair");
                    return;
                }
                creep.log("Choosing remote reserve room");
                creep.chooseReserveRoom();
                if (creep.memory.flagName && creep.memory.reserveRoom) {
                    creep.state = STATE._MOVE;
                }
                break;
            // MOVE state
            case STATE._MOVE:
                creep.log("In move state");
                if (creep.room.name === creep.memory.reserveRoom) {
                    creep.log("appears to have arrived");
                    creep.state = STATE._ARRIVED;
                    this.run(creep);
                    break;
                }
                creep.log("Has not arrived");
                // lets move it
                if (creep.memory.reserveRoom === undefined) {
                    creep.log("No reserve room set");
                    creep.state = STATE._INIT;
                }
                creep.goToRoom(creep.memory.reserveRoom!);
                break;
            // ARRIVED state
            case STATE._ARRIVED:
                creep.log("Creep has arrived");
                // have we somehow changed room?
                if (creep.memory.reserveRoom !== creep.room.name) {
                    // Back into move state
                    creep.state = STATE._MOVE;
                    this.run(creep);
                    break;
                }
                // Reserve the remote room
                creep.reserveRemoteRoom();
                break;
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                break;
        }
    }
}

Creep.prototype.chooseReserveRoom = function(): void {
    if (!this.memory.flagName &&  !this.memory.reserveRoom) {
        this.log("No flag in memory or reserve in memory");
        // @todo perhaps add distance to the filter
        const flags = _.filter(Game.flags, (f: Flag) =>
            f.color === global.flagColor.reserve &&
            f.assignedCreep !== this);
        if (flags.length === 0) {
            this.log("No flags found, must be an issue");
        }
        for (const i in flags) {
            const flag: Flag = flags[i];
            this.log("Considering " + flag.name);
            const distance = Game.map.getRoomLinearDistance(this.room.name, flag.pos.roomName);
            if (distance > 2) {
                this.log("Distance " + distance + " too far");
                continue;
            }
            // check for other creeps that are assigned to this flag
            const creeps = _.filter(Game.creeps, (c: Creep) =>
                c.role === RemoteReserver.roleName &&
                c.memory.reserveRoom === flag.pos.roomName &&
                c.memory.flagName === flag.name &&
                c.name !== this.name &&
               !c.memory.dying);
            // If any were found skip it
            if (creeps.length > 0) {
                this.log("other creep assigned");
                continue;
            }
            this.memory.flagName = flag.name;
            this.memory.reserveRoom = flag.pos.roomName;
            flag.assignedCreep = this;
        }
    }
};

Creep.prototype.reserveRemoteRoom = function(): void {
    // make sure this room has a controller before we go on
    if (this.room.controller) {
        // are we in range?
        if (this.pos.inRangeTo(this.room.controller, 1)) {
            this.log("Target should be in range, attempting reserve");
            if (this.reserveController(this.room.controller) === ERR_NOT_IN_RANGE) {
                this.log("Reserve Failed out of range");
            } else {
                this.signController(this.room.controller, "Room Reserved by Subodai - [Ypsilon Pact]");
                return;
            }
        }
        this.travelTo(this.room.controller, {ensurePath : true});
        this.roadCheck();
    }
};
