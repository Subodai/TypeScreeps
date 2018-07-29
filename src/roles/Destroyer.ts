import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Builders turn energy into structures
 */
export class Destroyer {
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#bfff00";
    public static roleName: string = "destroy";
    public static roster: number[] = [ 0, 2, 2, 2, 2, 2, 2, 3, 3 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ WORK: 1, CARRY: 1, MOVE: 1 }),
        BodyBuilder({ WORK: 3, CARRY: 1, MOVE: 4 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 16, CARRY: 8, MOVE: 24 }),
        BodyBuilder({ WORK: 16, CARRY: 8, MOVE: 24 })
    ];
    // is role enabled
    public static enabled(room: Room): boolean {
        if (room.memory.emergency) { return false; }
        if (!room.memory.charging) { return false; }
        if (room.getDeconList().length > 0) {
            return true;
        }
        return false;
    }
    // Run this role
    public static run(creep: Creep): void {
        // if creep is dying make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        if (!creep.canDo(WORK)) {
            creep.log("Damaged seeking repair");
            return;
        }
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
            case STATE._GATHER:
                this.runGatherState(creep);
                break;
            case STATE._DELIVER:
                this.runDeliverState(creep);
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
        creep.log("Initiating Destroyer");
        creep.chooseDeconstructionTarget();
        creep.state = STATE._GATHER;
        this.run(creep);
    }

    /**
     * Gather energy from items we need to deconstruct
     *
     * @param creep Creep
     */
    private static runGatherState(creep: Creep): void {
        creep.log("In gather state");
        const gatherResult = creep.deconstructRoomTargets();
        creep.log(gatherResult.toString());
        if (gatherResult === OK) {
            creep.log("dismantled successfully");
            return;
        }

        if (gatherResult === ERR_NOT_IN_RANGE) {
            creep.log("not in range moving to target");
            return;
        }

        if (gatherResult === ERR_FULL) {
            creep.log("Full, changing to deliver");
            creep.state = STATE._DELIVER;
            this.run(creep);
            return;
        }

        if (gatherResult === ERR_NOT_FOUND) {
            creep.log("Nothing left to dismantle, despawning");
            creep.deSpawn();
            return;
        }

        if (gatherResult === ERR_INVALID_TARGET) {
            creep.chooseDeconstructionTarget();
            // DO nothing, will pick another target next run
            return;
        }
    }

    /**
     * Deliver energy back to our strorage/terminal/whatever
     *
     * @param creep Creep
     */
    private static runDeliverState(creep: Creep): void {
        creep.log("Delivering energy");
        if (creep.empty()) {
            creep.state = STATE._INIT;
            // this.run(creep);
        }
        if (creep.deliverEnergy() === OK) {
            creep.log("Delivered some energy");
            creep.state = STATE._INIT;
        }
    }
}
