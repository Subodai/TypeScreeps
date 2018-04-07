import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Builders turn energy into structures
 */
export class Builder {

    public static ticksBeforeRenew: number = 100;

    public static roleName: string = "Miner";

    public static roster: number[] = [
        0,
        2,
        2,
        2,
        2,
        1,
        1,
        1,
        1
    ];

    public static bodyStructure: BodyPartConstant[][] = [
        [],
        BodyBuilder({ WORK: 2, CARRY: 1, MOVE: 1 }),
        BodyBuilder({ WORK: 3, CARRY: 1, MOVE: 4 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 4, CARRY: 2, MOVE: 6 }),
        BodyBuilder({ WORK: 16, CARRY: 8, MOVE: 24 }),
        BodyBuilder({ WORK: 16, CARRY: 8, MOVE: 24 })
    ];

    public static enabled(room: Room): boolean {
        // fetch all construction sites within 3 rooms of this one
        const sites: ConstructionSite[] = _.filter(Game.constructionSites, (s: ConstructionSite) =>
            s.my && (Game.map.getRoomLinearDistance(room.name, s.pos.roomName) < 3)
        );
        // enabled if there are any
        return (sites.length > 0);
    }

    public static run(creep: Creep): void {
        creep.deathCheck(this.ticksBeforeRenew);
        switch (creep.state) {
            // SPAWN state
            case STATE._SPAWN:
                creep.log("In spawn state");
                if (!creep.isTired()) {
                    creep.log("Done spawning, transitioning to init");
                    creep.state = STATE._INIT;
                    this.run(creep);
                }
                break;
            // INIT state
            case STATE._INIT:
                creep.log("Initiating Builder");

                break;
            default:
                break;
        }
    }
}
