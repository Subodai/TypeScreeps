import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Remote energy miner
 */
export class RemoteEnergyMiner {
    public static ticksBeforeRenew: number = 200;
    public static colour: string = "#ff66ff";
    public static roleName: string = "rEMiner";
    public static roster: number[] = [ 0, 0, 4, 4, 4, 4, 4, 4, 4 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        [],
        BodyBuilder({ WORK: 5, CARRY: 1, MOVE: 5 }),
        BodyBuilder({ WORK: 8, CARRY: 1, MOVE: 8 }),
        BodyBuilder({ WORK: 10, CARRY: 1, MOVE: 10 }),
        BodyBuilder({ WORK: 10, CARRY: 1, MOVE: 10 }),
        BodyBuilder({ WORK: 10, CARRY: 1, MOVE: 10 }),
        BodyBuilder({ WORK: 10, CARRY: 1, MOVE: 10 }),
        BodyBuilder({ WORK: 10, CARRY: 1, MOVE: 10 })
    ];
    // is it enabled?
    public static enabled(room: Room): boolean {
        // @todo is this check necessary?
        // not enabled for rooms that aren't mine
        if (!room.controller || !room.controller.my) {
            return false;
        }
        // get all reserve flags
        const flags = _.filter(Game.flags, (f) =>
            f.color === global.flagColor.remote &&
            Game.map.getRoomLinearDistance(room.name, f.pos.roomName) <= 2
        );
        // no flags, no spawns
        if (flags.length === 0) {
            return false;
        }
        for (const i in flags) {
            // grab the flag
            const flag = flags[i];
            // required default to 1 (we can add more once we have room visibility)
            let required = 1;
            // now the room
            const r = Game.rooms[flag.pos.roomName];
            // if we have a room lets check now many miners we need
            if (r) {
                if (r.memory.minersNeeded) {
                    required = r.memory.minersNeeded;
                }
            } else {
                // have we been there before?
                const m = Memory.rooms[flag.pos.roomName];
                if (m) {
                    if (m.minersNeeded) {
                        required = m.minersNeeded;
                    }
                }
            }
            const creeps = _.filter(Game.creeps, (c: Creep) =>
                c.memory.role === this.roleName &&
                c.memory.remoteRoom === flag.pos.roomName &&
               !c.memory.dying);
            if (creeps.length < required) {
                return true;
            }
        }
        // nothing to report return false
        return false;
    }
    // run the creep role
    public static run(creep: Creep): void {
        // if creep dying make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        if (!creep.canDo(WORK)) {
            creep.log("Damaged seeking repair");
            return;
        }
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
                creep.log("Initiating Remote Miner");
                // Make sure we can catually WORK
                creep.log("Choosing remote mining room");
                creep.chooseRemoteMinerRoom();
                if (creep.memory.flagName) {
                    creep.state = STATE._MOVE;
                }
                break;
            // MOVE state
            case STATE._MOVE:
                creep.log("In move state");
                if (creep.room.name === creep.memory.remoteRoom) {
                    creep.state = STATE._ARRIVED;
                    this.run(creep);
                    break;
                }
                // lets move it
                creep.goToRoom(creep.memory.remoteRoom!);
                creep.roadCheck(creep.canDo(WORK));
                break;
            // ARRIVED state
            case STATE._ARRIVED:
                creep.log("Creep has arrived");
                // have we somehow changed room?
                if (creep.memory.remoteRoom !== creep.room.name) {
                    // Back into move state
                    creep.state = STATE._MOVE;
                    this.run(creep);
                    break;
                }
                // If we can pick a source, move on to next state
                if (creep.pickSource()) {
                    creep.log("Source Chosen, transitioning to gather");
                    creep.state = STATE._GATHER;
                    this.run(creep);
                }
                break;
            // GATHER state
            case STATE._GATHER:
                creep.log("Moving to remote source");
                if (creep.moveToSource() === OK) {
                    creep.state = STATE._MINE;
                    this.run(creep);
                }
                creep.roadCheck(creep.canDo(WORK));
                break;
            // MINE state
            case STATE._MINE:
                creep.log("Mining Remote Source");
                if (creep.containerCheck()) {
                    return;
                }
                creep.mineSource();
                break;
            // default catcher
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                this.run(creep);

        }
    }
}

Creep.prototype.chooseRemoteMinerRoom = function(): void {
    if (!this.memory.flagName) {
        this.log("No flag in memory");
        // check for flags
        const flags = _.filter(Game.flags, (f: Flag) =>
            f.color === global.flagColor.remote);
        if (flags.length === 0) {
            this.log("No Remote flags found, must be an issue");
        }
        for (const i in flags) {
            const flag: Flag = flags[i];
            this.log("Considering " + flag.name);
            const distance = Game.map.getRoomLinearDistance(this.room.name, flag.pos.roomName);
            if (distance > 2) {
                this.log("Distance " + distance + " too far");
                continue;
            }
            const room = Game.rooms[flag.pos.roomName];
            let useFlag = true;
            // do we have a room?
            if (room) {
                if (room.memory.minersNeeded && room.memory.minersNeeded > 0) {
                    const creeps = _.filter(Game.creeps, (c: Creep) =>
                        c.role === RemoteEnergyMiner.roleName &&
                        c.memory.remoteRoom === flag.pos.roomName &&
                       !c.memory.dying);
                    if (creeps.length >= room.memory.minersNeeded) {
                        useFlag = false;
                    }
                }
            }
            if (useFlag) {
                this.memory.flagName = flag.name;
                this.memory.remoteRoom = flag.pos.roomName;
                return;
            }
        }
    }
};
