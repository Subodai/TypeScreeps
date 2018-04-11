import * as STATE from "config/states";
import { Debug } from "functions/debug";
import "roles/Builder";
import "roles/Miner";
import "roles/Upgrader";
import "utils/Traveler";
import "./creep/basicActions";
import "./creep/energyActions";
import "./creep/memory";
import "./creep/mineralActions";

/**
 * Creep Prototype Extension
 */

// Some debug
Debug.Load("Prototype: Creep");

/**
 * Log Handler to make it tidier
 */
Creep.prototype.log = function(msg: string): void {
    Debug.creep(msg, this);
};

Creep.prototype.findSpaceAtSource = function(source: Source): boolean {
    if (source.id === "5982fecbb097071b4adc1835") {
        // this.DBG = true;
    }
    if (this.pos.getRangeTo(source) === 1) {
        this.log("Already at the source");
        return true;
    }
    this.log("Checking for space at source " + source.id);
    // return true;
    // Make sure to initialise the source's last check memory
    if (!source.memory.lastSpaceCheck) {
        source.memory.lastSpaceCheck = 0;
    }
    if (this.memory.lastSpaceCheck === Game.time) {
        if (this.memory.lastSpaceCheck && this.memory.lastSpaceCheck === source.memory.lastSpaceCheck) {
            this.log("Already checked this tick, assuming space available");
            return true;
        }
    } else {
        delete this.memory.lastSpaceCheck;
    }
    // If we checked the space this tick and there's no space left,
    // we don't need to check again we just need to decrement the spaces
    if (source.memory.lastSpaceCheck === Game.time) {
        this.log("Last Check was this tick");
        if (source.memory.spaces === 0) {
            this.log("No more spaces");
            return false;
        } else {
            // Decrement the spaces left
            source.memory.spaces = source.memory.spaces - 1;
            this.log("Found a space " + source.memory.spaces + "remaining");
            this.memory.lastSpaceCheck = source.memory.lastSpaceCheck;
            return true;
        }
    }
    this.log("First check for space at source");
    let spaces = 1;
    const n: RoomPosition = new RoomPosition(source.pos.x, (source.pos.y - 1), source.pos.roomName);
    if (this.checkEmptyAtPos(n)) { spaces++; }
    const ne: RoomPosition = new RoomPosition((source.pos.x + 1), (source.pos.y - 1), source.pos.roomName);
    if (this.checkEmptyAtPos(ne)) { spaces++; }
    const e: RoomPosition = new RoomPosition((source.pos.x + 1), source.pos.y, source.pos.roomName);
    if (this.checkEmptyAtPos(e)) { spaces++; }
    const se: RoomPosition = new RoomPosition((source.pos.x + 1), (source.pos.y + 1), source.pos.roomName);
    if (this.checkEmptyAtPos(se)) { spaces++; }
    const s: RoomPosition = new RoomPosition(source.pos.x, (source.pos.y + 1), source.pos.roomName);
    if (this.checkEmptyAtPos(s)) { spaces++; }
    const sw: RoomPosition = new RoomPosition((source.pos.x - 1), (source.pos.y + 1), source.pos.roomName);
    if (this.checkEmptyAtPos(sw)) { spaces++; }
    const w: RoomPosition = new RoomPosition((source.pos.x - 1), source.pos.y, source.pos.roomName);
    if (this.checkEmptyAtPos(w)) { spaces++; }
    const nw: RoomPosition = new RoomPosition((source.pos.x - 1), (source.pos.y - 1), source.pos.roomName);
    if (this.checkEmptyAtPos(nw)) { spaces++; }
    this.log("We found " + spaces + " spaces at source" + source.id);
    // Set our memory
    source.memory.lastSpaceCheck = Game.time;
    source.memory.spaces = spaces;
    // If it's 0 there's no space
    if (source.memory.spaces === 0) {
        return false;
    } else {
        // If it's not 0, there is a space, lets take one off our count and return true
        // Decrement the spaces left
        source.memory.spaces = source.memory.spaces - 1;
        return true;
    }
};

Creep.prototype.checkEmptyAtPos = function(pos: RoomPosition): boolean {
    const terrain: Terrain = Game.map.getTerrainAt(pos);
    if (terrain === "wall") {
        this.log("Wall found at " + JSON.stringify(pos));
        return false;
    }
    const creeps: Creep[] = pos.lookFor(LOOK_CREEPS);
    if (creeps.length === 0) {
        this.log("Space found at " + JSON.stringify(pos));
        return true;
    }
    // is this the creep we're trying to find a space for
    if (creeps[0] === this) {
        this.log("We are at " + JSON.stringify(pos));
        return true;
    }
    this.log("Other creep [" + creeps[0].name + "] found at " + JSON.stringify(pos));
    return false;
};

/**
 * Road check
 */
Creep.prototype.roadCheck = function(work: boolean = false): void {
    let road: Structure | boolean = false;
    let site: ConstructionSite | boolean = false;
    let flag: Flag | boolean = false;
    // Don't lay roads no room edges
    if (this.pos.isRoomEdge()) { return; }
    const obj = this.room.lookForAt(LOOK_STRUCTURES, this.pos);
    if (obj.length > 0) {
        for (const i in obj) {
            if (obj[i].structureType === STRUCTURE_ROAD) {
                this.log("Already road here");
                road = obj[i];
                break;
            }
        }
    }
    if (road && work && this.carry.energy > 0) {
        if (road.hits < road.hitsMax) {
            this.log("Repairing existing road");
            this.repair(road);
        } else {
            this.log("Road good to go");
        }
        return;
    }
    if (road) {
        this.log("Already road, no action to perform");
        return;
    }
    // No road?
    if (!road) {
        // Are we in one of our OWN rooms
        if (this.room.controller) {
            if (this.room.controller.my) {
                // DO nothing don't want millions of roads!
                return;
            }
        }
        this.log("No road, looking for construction site");
        // Check for construction sites
        const sites = this.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.pos);
        if (sites.length > 0) {
            this.log("Found construction site");
            if (sites[0].structureType === STRUCTURE_ROAD) {
                site = sites[0];
            }
        }
    }
    if (site && work && this.carry.energy > 0) {
        this.log("Building construction site");
        this.build(site);
        return;
    }
    // No site?
    if (!site) {
        this.log("No construction site, looking for flags");
        // Check for flag
        const flags = _.filter(Game.flags, (f) => f.pos === this.pos);
        // let flags = this.room.lookForAt(LOOK_FLAGS, this.pos);
        if (flags.length > 0) {
            this.log("Found a flag");
            flag = flags[0];
        }
    }
    this.log(" No road, site, or flag.. attempting to place one");
    this.log(JSON.stringify(this.pos));
    // No site, no flag, and we're seeding remote roads
    if (!site && !flag && global.seedRemoteRoads === true) {
        // How many construction flags do we have?
        const roadFlags = _.filter(Game.flags, (f) =>
        f.color === global.flagColor.buildsite && f.secondaryColor === COLOR_WHITE);
        // If we have 100 or more road flags, don't make any more!
        if (roadFlags.length >= 100) {
            this.log("Enough flags not dropping any more");
            return;
        }
        this.log("Dropping a flag");
        this.pos.createFlag();
        return;
    }
};

/**
 * Check and repair container if sat on one
 */
Creep.prototype.containerCheck = function(): void | boolean {
    // If we're in our own room, stop right there! no container check here please
    if (this.room.controller && this.room.controller.my) { return; }
    // Check we have energy (and it's higher than 0.. because 0 probably means we got smacked and lost our carry)
    if (this.carry.energy >= this.carryCapacity && this.carry.energy > 0) {
        let container: StructureContainer | boolean = false;
        // Check for structures at our pos
        const objects = this.pos.lookFor(LOOK_STRUCTURES);
        if (objects.length > 0) {
            for (const i in objects) {
                if (objects[i].structureType === STRUCTURE_CONTAINER) {
                    container = objects[i] as StructureContainer;
                    break;
                }
            }
        }
        // Is there a container?
        if (container) {
            if (container.hits < container.hitsMax) {
                this.repair(container);
                return;
            }
        } else {
            let constructionSite: ConstructionSite | boolean = false;
            // Get sites
            const sites = this.pos.lookFor(LOOK_CONSTRUCTION_SITES);
            // If there are some
            if (sites.length > 0) {
                // loop
                for (const i in sites) {
                    // is this site a container?
                    if (sites[i].structureType === STRUCTURE_CONTAINER) {
                        constructionSite = sites[i];
                        break;
                    }
                }
            }
            // Did we find one?
            if (constructionSite) {
                this.build(constructionSite);
                this.say(global.sayBuild);
                return true;
            } else {
                this.pos.createConstructionSite(STRUCTURE_CONTAINER);
                return;
            }
        }
    }
};

Creep.prototype.repairStructures = function(r: boolean = false, d: boolean = false, s: boolean = false): number {
    // First are we empty?
    if (this.carry.energy === 0) {
        this.log("Empty cannot repair anything");
        // Clear repair target
        delete this.memory.repairTarget;
        delete this.memory.targetMaxHP;
        return ERR_NOT_ENOUGH_ENERGY;
    }
    // Is their an item in memory, with full health already?
    if (this.memory.repairTarget) {
        const target: Structure | null = Game.getObjectById(this.memory.repairTarget);
        if (target) {
            let targetHits = 0;
            if (this.memory.targetMaxHP) {
                targetHits = this.memory.targetMaxHP;
            }
            // Have we already filled the items health to what we want?
            if (target.hits >= targetHits) {
                // Clear the target, time for a new one
                delete this.memory.repairTarget;
                delete this.memory.targetMaxHP;
            }
        } else {
            delete this.memory.repairTarget;
            delete this.memory.targetMaxHP;
        }
    }
    // Do we have a repairTarget in memory?
    if (!this.memory.repairTarget && d) {
        this.log("Has no repair target, looking for 1 hp ramparts and walls");
        // Check for walls or ramparts with 1 hit first
        const targets = this.room.find(FIND_STRUCTURES, {
            filter: (i) => (i.structureType === STRUCTURE_RAMPART || i.structureType === STRUCTURE_WALL) &&
            i.hits === 1 && i.room === this.room
        });

        if (targets.length > 0) {
            this.log("Found a 1 hp item, setting target");
            this.memory.repairTarget = _.min(targets, (t) => t.hits).id;
            this.memory.targetMaxHP = 10;
        }
    }

    // Next juice up walls and ramparts to 600
    if (!this.memory.repairTarget && d) {
        this.log("Has no repair target, looking for < 600hp ramparts and walls");
        const targets = this.room.find(FIND_STRUCTURES, {
            filter: (i) => (i.structureType === STRUCTURE_RAMPART || i.structureType === STRUCTURE_WALL)
                            && i.hits <= 600 && i.room === this.room
        });
        if (targets.length > 0) {
            this.memory.repairTarget = _.min(targets, (t) => t.hits).id;
            this.memory.targetMaxHP = 600;
        }
    }

    // Next find damaged structures that aren't walls, ramparts or roads
    if (!this.memory.repairTarget && s) {
        this.log("Has no repair target, looking for damaged structures");
        this.findDamagedStructures();
    }

    // Next find Damaged Roads
    if (!this.memory.repairTarget && r) {
        this.log("Has no repair target, looking for damaged roads");
        // this.findDamagedRoads();
    }

    // Next find Damaged defence items (wall, rampart)
    if (!this.memory.repairTarget && d) {
        this.log("Has no repair target, looking for damaged defences");
        // this.findDamagedDefences();
    }
    // Do we have something to repair?
    if (this.memory.repairTarget) {
        this.log("Has a repair target, checking close enough to repair");
        const target: Structure | null = Game.getObjectById(this.memory.repairTarget);
        // Make sure target is still valid
        let targetHits = 0;
        if (this.memory.targetMaxHP) {
            targetHits = this.memory.targetMaxHP;
        }
        if (target) {
            if (target.hits >= targetHits) {
                this.log("Repair target at target XP deleting target from memory");
                delete this.memory.repairTarget;
                delete this.memory.targetMaxHP;
                return ERR_FULL;
            }
            if (this.pos.inRangeTo(target, 3)) {
                this.log("Target in range, attempting repair");
                // attempt repair
                if (this.repair(target) === ERR_NOT_IN_RANGE) {
                    this.log("Repair Failed");
                }
            } else {
                this.log("Travelling to target");
                this.travelTo(target);
                return OK;
            }
        }
    } else {
        // Nothing to repair?
        // No targets.. head back to the room spawn
        const spawn: StructureSpawn = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (i) => i.structureType === STRUCTURE_SPAWN
        }) as StructureSpawn;
        if (spawn) {
            if (spawn.recycleCreep(this) === ERR_NOT_IN_RANGE) {
                this.travelTo(spawn);
            }
        }
        return ERR_INVALID_TARGET;
    }
    return OK;
};
