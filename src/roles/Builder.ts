import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Builders turn energy into structures
 */
export class Builder {
    // when to renew
    public static ticksBeforeRenew: number = 100;
    // the colour for visuals
    public static colour: string = "#99ccff";
    // Rolename
    public static roleName: string = "Builder";
    // Roster
    public static roster: number[] = [
        0,
        6,
        6,
        4,
        4,
        4,
        4,
        1,
        1
    ];

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

    public static enabled(room: Room): boolean {
        // fetch all construction sites within 3 rooms of this one
        const sites: ConstructionSite[] = _.filter(Game.constructionSites, (s: ConstructionSite) =>
            s.my && (Game.map.getRoomLinearDistance(room.name, s.pos.roomName) < 3 || room.name === s.pos.roomName)
        );
        // enabled if there are any
        return (sites.length > 0);
    }

    public static run(creep: Creep): void {
        // if creep is tired, don't waste intents
        if (creep.isTired()) {
            creep.log("Tired");
            return;
        }
        // if creep is dying make sure it gets renewed
        creep.deathCheck(this.ticksBeforeRenew);
        // run as normal
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
                creep.state = STATE._GATHER;
                this.run(creep);
                break;
            // GATHER state
            case STATE._GATHER:
                creep.log("In gather state");
                if (creep.getNearbyEnergy(true) === ERR_FULL) {
                    creep.log("Got some energy");
                    creep.clearTargets();
                    creep.state = STATE._CONSTRUCT;
                    this.run(creep);
                }
                break;
            // CONSTRUCT state
            case STATE._CONSTRUCT:
                creep.log("In construct state");
                const result = creep.buildNearestSite();
                if (result === OK) {
                    creep.log("Built Site");
                }
                if (result === ERR_NOT_ENOUGH_RESOURCES) {
                    creep.log("Out of energy");
                    creep.clearTargets();
                    creep.state = STATE._GATHER;
                    this.run(creep);
                }
                if (result === ERR_INVALID_TARGET) {
                    creep.log("Invalid Site Resetting Memory");
                    creep.clearTargets();
                    this.run(creep);
                }
                break;
            // default fallback
            default:
                creep.log("Creep in unknown state");
                creep.state = STATE._INIT;
                break;
        }
    }
}
