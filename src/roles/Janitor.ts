import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Wall and Rampart Builder
 */
export class Janitor {
    public static ticksBeforeRenew: number = 150;
    public static colour: string = "#006699";
    public static roleName: string = "janitor";
    public static roster: number[] = [ 0, 0, 0, 0, 0, 0, 0, 1, 1 ];
    public static bodyStructure: BodyPartConstant[][] = [
        [], [], [], [], [], [], [],
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 })
    ];

    public static enabled(room: Room): boolean {
        if (room.controller) {
            if (room.controller.level >= 7 && room.storage) {
                // @todo move to own method
                // get all walls and ramparts below their max hp
                const items: Structure[] = room.find(FIND_STRUCTURES, {
                    filter: (s: AnyStructure) =>
                        // ramparts below max
                        (s.structureType === STRUCTURE_RAMPART && s.hits < global.rampartMax) ||
                        // walls below max
                        (s.structureType === STRUCTURE_WALL && s.hits < global.wallMax) ||
                        // anything else
                        (
                            // not a wall, rampart or road
                            (
                                s.structureType !== STRUCTURE_WALL &&
                                s.structureType !== STRUCTURE_RAMPART &&
                                s.structureType !== STRUCTURE_ROAD
                            ) &&
                            // with less than 100hp
                            s.hits < s.hitsMax
                        )
                });
                if (items.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
