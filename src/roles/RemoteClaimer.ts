import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";
import { Upgrader } from "./Upgrader";

/**
 * Remote room claimer
 */
export class RemoteClaimer {
    public static ticksBeforeRenew: number = 0;
    public static colour: string = "#ffffff";
    public static roleName: string = "rClaim";
    public static roster: number[] = [ 0, 0, 0, 1, 1, 1, 1, 1, 1 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        [],
        [],
        BodyBuilder({ CLAIM: 1, MOVE: 1}),
        BodyBuilder({ CLAIM: 1, CARRY: 1, WORK: 1, MOVE: 3 }),
        BodyBuilder({ CLAIM: 2, CARRY: 1, WORK: 1, MOVE: 4 }),
        BodyBuilder({ CLAIM: 2, CARRY: 1, WORK: 1, MOVE: 4 }),
        BodyBuilder({ CLAIM: 2, CARRY: 1, WORK: 1, MOVE: 4 }),
        BodyBuilder({ CLAIM: 2, CARRY: 1, WORK: 1, MOVE: 4 })
    ];
    // is it enabled
    public static enabled(room: Room): boolean {
        if (!room.controller || !room.controller.my) {
            return false;
        }
        // get claim flags
        const flags = _.filter(Game.flags, (f: Flag) =>
            f.color === global.flagColor.claim &&
            f.assignedCreep === null &&
            Game.map.getRoomLinearDistance(room.name, f.pos.roomName) <= 5
        );
        // no flags, no spawn
        if (flags.length === 0) {
            return false;
        }
        // loop through flags
        for (const i in flags) {
            // get the flag
            const flag = flags[i];
            const creeps = _.filter(Game.creeps, (c: Creep) =>
                c.memory.role === this.roleName &&
                c.memory.flagName === flag.name &&
                c.memory.remoteRoom === flag.pos.roomName &&
               !c.memory.dying
            );
            if (creeps.length === 0) {
                // no creeps let's go!
                return true;
            }
        }
        // nothing to report
        return false;
    }
    // run the creep role
    public static run(creep: Creep): void {
        creep.deathCheck(this.ticksBeforeRenew);
        // Make sure we can claim
        if (!creep.canDo(CLAIM)) {
            creep.log("Damaged, seeking repair");
            return;
        }
        // run state
        switch (creep.state) {
            // Spawn state
            case STATE._SPAWN:
                creep.log("in spawn state");
                if (!creep.isTired()) {
                    creep.log("Done spawning setting to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            // INIT state
            case STATE._INIT:
                creep.log("Initiating Remote Claimer");
                creep.log("Choosing remote claim room");
                creep.chooseClaimRoom();
                if (creep.memory.flagName && creep.memory.claimRoom) {
                    creep.state = STATE._MOVE;
                }
                break;
            // MOVE state
            case STATE._MOVE:
                creep.log("In move state");
                if (creep.room.name === creep.memory.claimRoom) {
                    creep.log("appears to have arrived");
                    creep.state = STATE._ARRIVED;
                    this.run(creep);
                    break;
                }
                creep.log("Has not arrived yet");
                // lets move it
                if (creep.memory.claimRoom === undefined) {
                    creep.log("No Claim Room Set");
                    creep.state = STATE._INIT;
                }
                creep.goToRoom(creep.memory.claimRoom!);
                break;
            // ARRIVED state
            case STATE._ARRIVED:
                creep.log("Creep has arrived");
                if (creep.memory.flagName) {
                    // clearing flag
                    const flag = Game.flags[creep.memory.flagName];
                    if (flag) {
                        creep.log("Deleting flag");
                        flag.remove();
                    }
                }

                // have we somehow moved back outside the room?
                if (creep.memory.claimRoom !== creep.room.name) {
                    // back into move state
                    creep.state = STATE._MOVE;
                    this.run(creep);
                    break;
                }
                // claim the remoteroom!
                creep.claimRemoteRoom();
                break;
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                break;
        }
    }
}

Creep.prototype.chooseClaimRoom = function(): void {
    if (!this.memory.flagName && !this.memory.claimRoom) {
        this.log("No flag in memory or claim room in memory");
        // @todo perhaps add distance to the filter
        const flags = _.filter(Game.flags, (f: Flag) =>
            f.color === global.flagColor.claim &&
            f.assignedCreep === null);
        if (flags.length === 0) {
            this.log("No flags found, must be an issue");
        }
        for (const i in flags) {
            const flag: Flag = flags[i];
            this.log("Considering " + flag.name);
            const distance = Game.map.getRoomLinearDistance(this.room.name, flag.pos.roomName);
            if (distance > 5) {
                this.log("Distance " + distance + " too far");
                continue;
            }
            // check for other creeps that are assigned to this flag
            const creeps = _.filter(Game.creeps, (c: Creep) =>
                c.role === RemoteClaimer.roleName &&
                c.memory.reserveRoom === flag.pos.roomName &&
                c.memory.flagName === flag.name &&
                c.name !== this.name &&
                !c.memory.dying);
            // If any were found skip it
            if (creeps.length > 0) {
                this.log("Other creep assigned");
                continue;
            }
            this.memory.flagName = flag.name;
            this.memory.claimRoom = flag.pos.roomName;
            flag.assignedCreep = this;
        }
    }
};

Creep.prototype.claimRemoteRoom = function(): void {
    // make sure this room has a controller before we go on
    if (this.room.controller) {
        // already ours?
        if (this.room.controller.my) {
            // clear target and switch to upgrader
            this.clearTargets();
            this.role = Upgrader.roleName;
            this.memory.level = 1;
            this.memory.roomName = this.pos.roomName;
        }
        // are we in range?
        if (this.pos.inRangeTo(this.room.controller, 1)) {
            this.log("Target should be in range, attempting claim");
            if (this.claimController(this.room.controller) === ERR_NOT_IN_RANGE) {
                this.log("Reserve Failed out of range");
            } else {
                this.signController(this.room.controller, "Room Claimed by Subodai - [Ypsilon Pact]");
                delete Memory.rooms[this.room.name];
                return;
            }
        }
        this.travelTo(this.room.controller, { ensurePath: true });
        this.roadCheck();
    }
};
