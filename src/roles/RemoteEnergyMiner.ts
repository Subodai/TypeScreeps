import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Remote energy miner
 */
export class RemoteEnergyMiner {
    public static ticksBeforeRenew: number = 200;
    public static colour: string = "#ff66ff";
    public static roleName: string = "rRes";
    public static roster: number[] = [ 0, 0, 0, 2, 4, 4, 4, 4, 4 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        [],
        [],
        BodyBuilder({ WORK: 5, CARRY: 1, MOVE: 4 }),
        BodyBuilder({ WORK: 6, CARRY: 1, MOVE: 5 }),
        BodyBuilder({ WORK: 7, CARRY: 1, MOVE: 6 }),
        BodyBuilder({ WORK: 7, CARRY: 1, MOVE: 6 }),
        BodyBuilder({ WORK: 7, CARRY: 1, MOVE: 6 }),
        BodyBuilder({ WORK: 7, CARRY: 1, MOVE: 6 })
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
                creep.log("Initiating Remote Miner");
                // Make sure we can catually WORK
                if (!creep.canDo(WORK)) {
                    creep.log("Damaged seeking repair");
                    return;
                }
                creep.log("Choosing remote mining room");
                creep.chooseRemoteMinerRoom();
                if (creep.memory.flagName) {
                    creep.state = STATE._MOVE;
                }
                break;
            // MOVE state
            case STATE._MOVE:
                creep.log("In move state");
                if (creep.room.name === creep.memory.reserveRoom) {
                    creep.state = STATE._ARRIVED;
                    this.run(creep);
                    break;
                }
                // lets move it
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

        }
    }
}

Creep.prototype.chooseRemoteMinerRoom = function(): void {

}

Creep.prototype.remoteMine = function(): void {

}

Creep.prototype.containerCheck = function(): boolean {

}
