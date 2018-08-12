import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

export class Scientist {
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#edf7ff";
    public static roleName: string = "scientist";
    public static roster: number[]      = [ 0, 0, 0, 0, 1, 1, 1, 1, 1 ];
    public static rosterLinks: number[] = [ 0, 0, 0, 0, 1, 1, 1, 1, 1 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        [],
        [],
        [],
        BodyBuilder({ CARRY: 5, MOVE: 5 }),
        BodyBuilder({ CARRY: 10, MOVE: 10 }),
        BodyBuilder({ CARRY: 10, MOVE: 10 }),
        BodyBuilder({ CARRY: 20, MOVE: 20 }),
        BodyBuilder({ CARRY: 20, MOVE: 20 })
    ];

    /**
     * Refillers are only enabled at RCL4+ with storage
     * @param room
     */
    public static enabled(room: Room): boolean {
        if (room.memory.emergency) {
            if (room.storage && room.storage.store[RESOURCE_ENERGY] < 10000) {
                return false;
            }
        }
        // Find active boost labs
        const labs = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_LAB &&
            s.labType !== "reactor" &&
            (s.compoundIn !== null || s.mineralIn !== null) &&
            (s.mineralAmount < s.mineralCapacity ||
            s.energy < s.energyCapacity) &&
            s.emptyMe === false
        });
        if (labs.length > 0) {
            return true;
        }
        return false;
    }

    public static run(creep: Creep): void {
        // if creep is dying make sure it get's renewed
        creep.deathCheck(this.ticksBeforeRenew);
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
                this.runInitState(creep);
                break;
            // GATHERM state
            case STATE._GATHERM:
                creep.log("Fetching resources");
                const gatherResult = creep.getNearbyMinerals(true, creep.memory.mineralType || undefined);
                if (gatherResult === ERR_FULL) {
                    creep.log("Got Resrouces");
                    creep.state = STATE._DELIVERM;
                    this.run(creep);
                }
                if (gatherResult === ERR_NOT_FOUND) {
                    if (creep.empty()) {
                        delete creep.memory.mineralType;
                        creep.log("Couldn't find resources resetting");
                        creep.state = STATE._INIT;
                    } else {
                        creep.state = STATE._DELIVERM;
                        return;
                    }
                }
                break;
            // GATHER state
            case STATE._GATHER:
                creep.log("In gather state");
                if (creep.getNearbyEnergy(true) === ERR_FULL) {
                    creep.log("Got some energy");
                    creep.state = STATE._DELIVER;
                    this.run(creep);
                }
                break;
            // DELIVER resource
            case STATE._DELIVERM:
                creep.log("Delivering resources");
                if (creep.empty()) {
                    creep.state = STATE._INIT;
                    return;
                }
                if (creep.fillLabs() === OK) {
                    creep.log("Delivered some resources");
                    delete creep.memory.mineralType;
                }
                break;
            // DELIVER state
            case STATE._DELIVER:
                creep.log("Delivering energy");
                if (creep.empty()) {
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                const result = creep.fillLabsEnergy();
                if (result === OK) {
                    creep.log("Delivered some energy");
                }
                if (result === false && creep.memory.idle && creep.memory.idle >= 10) {
                    const resourceTargets = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) =>
                            s.structureType === STRUCTURE_LAB &&
                            (s.mineralIn !== null || s.compoundIn !== null) &&
                            s.mineralAmount < s.mineralCapacity &&
                            s.labType !== "reactor" &&
                            s.emptyMe === false
                    });
                    if (resourceTargets.length > 0) {
                        creep.deliverEnergy();
                    }
                }
                break;
            // default unknown state
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                break;

        }
    }

    private static runInitState(creep: Creep): void {
        creep.log("Initiating Refiller");
        if (creep.atHome()) {
            creep.log("at home ready to gather");
            // Check for things that need energy
            const energyTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_LAB && s.energy < s.energyCapacity && s.my
            });
            if (energyTargets.length > 0) {
                creep.state = STATE._GATHER;
                this.run(creep);
                return;
            }

            const resourceTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (s) =>
                    s.structureType === STRUCTURE_LAB &&
                    (s.mineralIn !== null || s.compoundIn !== null) &&
                    s.mineralAmount < s.mineralCapacity &&
                    s.labType !== "reactor" &&
                    s.emptyMe === false
            }) as StructureLab[];
            if (resourceTargets.length > 0) {
                const target: StructureLab = _.min(resourceTargets, (l) => l.mineralAmount) as StructureLab;
                if (target.compoundIn) {
                    creep.memory.mineralType = target.compoundIn;
                } else if (target.mineralIn) {
                    creep.memory.mineralType = target.mineralIn;
                } else {
                    delete creep.memory.mineralType;
                }
                creep.state = STATE._GATHERM;
                this.run(creep);
                return;
            }

            // Just stick to gathering energy
            creep.state = STATE._GATHER;
            this.run(creep);
        }
    }
}
