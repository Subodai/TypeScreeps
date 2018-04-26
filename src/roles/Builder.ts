import * as STATE from "config/states";
import { BodyBuilder } from "functions/tools";

/**
 * Builders turn energy into structures
 */
export class Builder {
    public static ticksBeforeRenew: number = 100;
    public static colour: string = "#99ccff";
    public static roleName: string = "build";
    public static roster: number[] = [ 0, 6, 6, 4, 4, 4, 4, 1, 1 ];
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
        // fetch all construction sites within 3 rooms of this one
        const sites: ConstructionSite[] = _.filter(Game.constructionSites, (s: ConstructionSite) =>
            s.my && (Game.map.getRoomLinearDistance(room.name, s.pos.roomName) < 3 || room.name === s.pos.roomName)
        );
        // enabled if there are any
        return (sites.length > 0);
    }
    // Run this role
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
                    // this.run(creep);
                }
                if (result === ERR_INVALID_TARGET) {
                    creep.log("Invalid Site Resetting Memory");
                    creep.clearTargets();
                    // this.run(creep);
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

/**
 * Choose, goto and build the nearest construction site
 * @returns {ScreepsReturnCode | void}
 */
Creep.prototype.buildNearestSite = function(): ScreepsReturnCode | void {
    this.checkSiteInMemory();
    if (!this.memory.siteId) {
        this.findNearestConstructionSite();
    }
    if (this.memory.siteId) {
        return this.goToAndBuild(this.memory.siteId);
    } else {
        return this.deSpawn();
    }
};

/**
 * Go to and build a construction site
 * @param siteId {string}
 */
Creep.prototype.goToAndBuild = function(siteId: string): ScreepsReturnCode {
    const site: ConstructionSite | null = Game.getObjectById(siteId);
    if (!site) {
        return ERR_INVALID_TARGET;
    }
    // if we're more than 3 away
    if (this.pos.getRangeTo(site.pos) > 3) {
        // go to it
        this.travelTo(site);
        return ERR_NOT_IN_RANGE;
    }
    return this.build(site);
};

/**
 * Make sure the site stored in memory is valid
 * @returns {void}
 */
Creep.prototype.checkSiteInMemory = function(): void {
    // do we have an item in memory
    if (this.memory.siteId) {
        // Check the object exists first
        if (!Game.getObjectById(this.memory.siteId)) {
            // if it doesn't clear it
            delete this.memory.siteId;
            delete this.memory.targetRoom;
        }
    }
};

/**
 * Find the nearest constructionSite to a creep
 * @param my {boolean} optional, if false will pick enemy site
 * @returns {void}
 */
Creep.prototype.findNearestConstructionSite = function(my: boolean = true): void {
    // get the nearest site by range
    let site: ConstructionSite | null | undefined;
    if (my) {
        site = this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
    } else {
        site = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    }
    // if the findClosest failed (it does that sometimes)
    if (site === undefined || site === null) {
        for (const i in Game.constructionSites) {
            site = Game.getObjectById(i);
            if (Game.map.getRoomLinearDistance(this.room.name, site!.pos.roomName) > 2) {
                continue;
            }
            // did we find a site?
            if (site && my && site.my) {
                break;
            }

            if (site && !my && !site.my) {
                break;
            }
            // not sure how but we got here but clear the site
            site = null;
        }
    }
    if (site) {
        this.memory.siteId = site.id;
        this.memory.targetRoom = JSON.stringify(site.pos);
    }
};
