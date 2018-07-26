import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Remote room energy hauler
 */
export class RemoteEnergyHauler {
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#006600";
    public static roleName: string = "rEHaul";
    private static multiplier: number = 2;
    public static roster: number[] = [ 0, 0, 0, 2, 3, 6, 6, 6, 4 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ CARRY: 2, MOVE: 2 }),
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
        if (room.memory.emergency) { return false; }
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
        // if creep is dying make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        // Make sure we can actually carry stuff first
        if (!creep.canDo(CARRY)) {
            creep.log("Damaged seeking repair");
            return;
        }
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
                // Pick remote room to go to
                creep.chooseRemoteRoom();
                if (creep.memory.remoteRoom) {
                    creep.state = STATE._MOVE;
                    this.run(creep);
                }
                creep.log("No rooms to haul from");
                // go into move state
                break;
            // MOVE State
            case STATE._MOVE:
                creep.log("In move state");
                // Have we arrived in remote room?
                if (creep.room.name === creep.memory.remoteRoom) {
                    creep.state = STATE._GATHER;
                    this.run(creep);
                    break;
                }
                // not yet lets move to it
                creep.goToRoom(creep.memory.remoteRoom!);
                break;
            // GATHER State
            case STATE._GATHER:
                creep.log("In gather state");
                if (creep.getNearbyEnergy() === ERR_FULL) {
                    creep.log("Got some energy");
                    creep.state = STATE._RETURN;
                    this.run(creep);
                }
                break;
            // RETURN State
            case STATE._RETURN:
                if (!creep.memory.roomName) {
                    creep.chooseHomeRoom();
                }
                if (creep.atHome()) {
                    creep.state = STATE._DELIVER;
                    this.run(creep);
                }
                // Returning to deliver room (home or otherwise)
                // set to DELIVER state
                break;
            // DELIVER state
            case STATE._DELIVER:
                creep.log("Delivering energy");
                if (creep.empty()) {
                    creep.state = STATE._INIT;
                    // this.run(creep);
                    break;
                }
                const result = creep.deliverEnergy();
                if (result === OK) {
                    creep.log("Delivered some energy");
                    if (Memory.settings.fillLowest) {
                        delete creep.memory.roomName;
                    }
                }
                if (result === ERR_NOT_FOUND) {
                    creep.state = STATE._RETURN;
                }
                break;
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                break;
        }
    }
}

Creep.prototype.chooseRemoteRoom = function(): void {
    this.log("Choosing remote room");
    if (!Memory.settings) {
        Memory.settings = {};
    }
    if (!Memory.settings.fetchHighest) {
        Memory.settings.fetchHighest = false;
    }
    if (Memory.settings.fetchHighest) {
        this.log("Fetching higest, setting to remoteRoom");
        this.memory.remoteRoom = Memory.settings.remoteRoom;
        return;
    }
    this.log("Finding a remote room");
    const flags = _.filter(Game.flags, (f: Flag) => f.color === global.flagColor.haul && Game.rooms[f.pos.roomName]);
    if (flags.length === 0) {
        this.memory.remoteRoom = Memory.settings.remoteRoom;
    }
    flags.sort((a, b) =>
        Game.rooms[a.pos.roomName].collectableEnergy() -
        Game.rooms[b.pos.roomName].collectableEnergy());
    flags.reverse();
    for (const i in flags) {
        const flag: Flag = flags[i];
        const distance = Game.map.getRoomLinearDistance(this.room.name, flag.pos.roomName);
        if (distance > 2) {
            continue;
        }
        const room = Game.rooms[flag.pos.roomName];
        if (room) {
            if (room.collectableEnergy() <= 500 || room.hostiles() > 0) {
                continue;
            }
            this.memory.remoteRoom = flag.pos.roomName;
            return;
        }
    }
};

Creep.prototype.chooseHomeRoom = function(): void {
    if (Memory.settings.fillLowest) {
        this.log("Filling lowest");
        const home = this.memory._home || this.room.name;
        const remote = Memory.myRoom || "E18N4";
        if (Game.map.getRoomLinearDistance(home, remote) <= 3 &&
            Game.map.getRoomLinearDistance(this.room.name, remote) <= 3) {
            this.log("in Range setting to : " + remote);
            this.memory.roomName = remote;
            return;
        }
    }
    this.log("Normal, going home to " + this.memory._home);
    this.memory.roomName = this.memory._home;
};
