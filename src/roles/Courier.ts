import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Builders turn energy into structures
 */
export class Courier {
    private static minEnergyForSpawn: number = 50000;
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#4286f4";
    public static roleName: string = "courier";
    public static roster: number[] = [0, 5, 5, 5, 5, 5, 5, 5, 5];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ HEAL: 1, MOVE: 1 }),
        BodyBuilder({ HEAL: 1, MOVE: 1 }),
        BodyBuilder({ HEAL: 2, MOVE: 2 }),
        BodyBuilder({ HEAL: 4, MOVE: 4 }),
        BodyBuilder({ HEAL: 6, MOVE: 6 }),
        BodyBuilder({ HEAL: 7, MOVE: 7 }),
        BodyBuilder({ HEAL: 18, MOVE: 18 }),
        BodyBuilder({ HEAL: 25, MOVE: 25 })
    ];
    // is role enabled
    public static enabled(room: Room): boolean {
        if (room.memory.emergency) { return false; }
        if (room.memory.courierTarget) {
            if (room.storage && room.storage.store[RESOURCE_ENERGY] > this.minEnergyForSpawn) {
                return true;
            }
        }
        // TODO Check for some kind of state so we know we need to feed a room
        return false;
    }
    // Run this role
    public static run(creep: Creep): void {
        // if creep is dying make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        // run as normal
        switch (creep.state) {
            // SPAWN state
            case STATE._SPAWN:
                this.runSpawnState(creep);
                break;
            // INIT state
            case STATE._INIT:
                this.runInitState(creep);
                break;
            // GATHER state
            case STATE._MOVE:
                this.runMoveState(creep);
                break;
            case STATE._ARRIVED:
                this.runDonateState(creep);
                break;
            // default fallback
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                break;
        }
    }

    private static runSpawnState(creep: Creep): void {
        creep.log("In spawn state");
        if (!creep.isTired()) {
            creep.log("Done spawning, transitioning to init");
            creep.state = STATE._INIT;
            this.run(creep);
        }
    }

    private static runInitState(creep: Creep): void {
        creep.log("Initiating Courier");
        creep.memory.remoteRoom = creep.room.memory.courierTarget;
        creep.memory.roomName = creep.room.memory.courierTarget;
        creep.state = STATE._MOVE;
        this.run(creep);
    }

    private static runMoveState(creep: Creep): void {
        if (creep.memory.remoteRoom) {
            if (creep.room.name === creep.memory.remoteRoom) {
                creep.log("Arrived in target room");
                creep.state = STATE._ARRIVED;
                return;
            }
            creep.log("Travelling to target room");
            creep.goToRoom(creep.memory.remoteRoom);
            return;
        }
        creep.log("No remote room set?");
    }

    private static runDonateState(creep: Creep): void {
        creep.deSpawn();
    }
}
