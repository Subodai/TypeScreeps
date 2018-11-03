import { ALLIES } from "config/diplomacy";
import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

export class Hassler {
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#ff0000";
    public static roleName: string = "hsl";
    public static roster: number[] = [0, 2, 2, 2, 2, 2, 2, 3, 3];
    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ ATTACK: 2, MOVE: 2 }),
        BodyBuilder({ ATTACK: 2, MOVE: 2 }),
        BodyBuilder({ TOUGH:2, ATTACK: 2, MOVE: 4 }),
        BodyBuilder({ TOUGH:2, ATTACK: 3, MOVE: 5 }),
        BodyBuilder({ TOUGH: 2, ATTACK: 3, MOVE: 5 }),
        BodyBuilder({ TOUGH: 2, ATTACK: 3, MOVE: 5 }),
        BodyBuilder({ TOUGH: 5, ATTACK: 19, MOVE: 25, HEAL: 1 }),
        BodyBuilder({ TOUGH: 5, ATTACK: 19, MOVE: 25, HEAL: 1 })
    ];
    // is role enabled
    public static enabled(room: Room): boolean {
        if (room.memory.war) { return true; }
        return false;
    }

    public static run(creep: Creep): void {
        creep.deathCheck(this.ticksBeforeRenew);

        if (!creep.canDo(TOUGH)) {
            creep.log("Damaged seeking repair");
        }
        if (!creep.canDo(ATTACK)) {
            creep.log("Damaged seeking repair");
            return;
        }

        switch (creep.state) {
            // SPAWN
            case STATE._SPAWN:
                this.runSpawnState(creep);
                break;
            // INIT
            case STATE._INIT:
                this.runInitState(creep);
                break;
            // ATTACK
            case STATE._ATTACK:
                this.runAttackState(creep);
                break;
            default:
                creep.clearTargets();
                this.runSpawnState(creep);
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
        creep.log("Initiating Hassler");

        creep.state = STATE._ATTACK;
        this.run(creep);
    }

    private static runAttackState(creep: Creep): void {
        if (creep.memory.idle && creep.memory.idle >= 100) {
            // No targets.. head back to the room spawn
            var spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => i.structureType === STRUCTURE_SPAWN && i.my
            }) as StructureSpawn;

            if (spawn.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
                creep.travelTo(spawn);
                return;
            }
        }
        // Get a target
        let target: Creep | AnyStructure | null = null;

        if (!target) {
            const targetFlag = Game.flags['target'];

            if (targetFlag && targetFlag.pos.roomName === creep.room.name) {
                const targets = creep.room.lookForAt(LOOK_STRUCTURES, targetFlag.pos) as AnyStructure[];
                if (targets.length > 0) {
                    target = targets[0];
                }
            }
        }

        if (!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: (i) => !(ALLIES.indexOf(i.owner.username) > -1)
            });
        }

        if (!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (i) => !(ALLIES.indexOf(i.owner.username) > -1) && i.structureType === STRUCTURE_TOWER
            });
        }
        if (!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (i) => !(ALLIES.indexOf(i.owner.username) > -1) && i.structureType === STRUCTURE_SPAWN
            });
        }
        if (!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (i) => !(ALLIES.indexOf(i.owner.username) > -1) && i.structureType !== STRUCTURE_CONTROLLER
            });
        }
        // var target = false; // uncomment to override hostiles and go to flags
        if (target) {
            creep.memory.idle = 0;
            if (!creep.pos.inRangeTo(target, 1)) {
                creep.travelTo(target, {
                    ensurePath: true
                });
                creep.say(global.sayMove);
            }

            if (creep.pos.inRangeTo(target, 1)) {
                creep.attack(target);
                creep.say(global.sayAttack);
            }
        } else {
            // attempt to stop construction sites
            const site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (s) => !s.my
            });
            if (site) {
                creep.travelTo(site);
            } else {
                var flag = Game.flags['attack'];
                if (!flag) {
                    flag = Game.flags['stage'];
                }
                if (!flag) {
                    creep.memory.idle = (creep.memory.idle ? creep.memory.idle : 0) + 1;
                    return;
                } else {
                    // If we're more than 1 tile away attempt to move there
                    if (!creep.pos.inRangeTo(flag, 1)) {
                        creep.travelTo(flag, {
                            ensurePath: true
                        });
                    }
                }
            }
        }
    }
}
