import { ROLEMODELS, ROLES } from "config/constants";
import { ALLIES } from "config/diplomacy";
import { Debug } from "functions/debug";
import { Miner } from "roles/Miner";
import { MineralExtractor } from "roles/MineralExtractor";
import { RemoteEnergyMiner } from "roles/RemoteEnergyMiner";

Debug.Load("Prototype: Room");
Room.prototype.log = function(msg: string): void {
    Debug.Room(msg, this);
};

/**
 * The enemies in a room
 */
Object.defineProperty(Room.prototype, "enemies", {
    configurable: true,
    enumerable: true,
    get(): {} | undefined {
        if (!Memory.rooms[this.name]) {
            Memory.rooms[this.name] = {};
        }
        if (!Memory.rooms[this.name].enemies) {
            Memory.rooms[this.name].enemies = {};
        }
        return Memory.rooms[this.name].enemies;
    },
    set(v: {}): {} {
        return _.set(Memory, "rooms." + this.name + ".enemies", v);
    }
});

Object.defineProperty(Room.prototype, "targets", {
    configurable: true,
    enumerable: true,
    get(): string[] | undefined {
        if (!Memory.rooms[this.name]) {
            Memory.rooms[this.name] = {};
        }
        if (!Memory.rooms[this.name].targets) {
            Memory.rooms[this.name].targets = [];
        }
        return Memory.rooms[this.name].targets;
    },
    set(v: string[]): string[] {
        return _.set(Memory, "rooms." + this.name + ".targets", v);
    }
});

/*
* Initiate a room's basic memory setup
*/
Room.prototype.init = function(): void {
    if (!this.memory.init) {
        this.memory.init = true;
        if (this.controller && this.controller.my) {
            if (!this.memory.mode) { this.memory.mode = "normal"; }
            if (!this.memory.war) { this.memory.war = false; }
            if (!this.memory.charging) { this.memory.charging = true; }
            if (!this.memory.roles) { this.memory.roles = {}; }
            if (!this.memory.links) { this.memory.links = false; }
            if (!this.memory.prioritise) { this.memory.prioritise = "none"; }
        } else {
            if (!this.memory.mode) { this.memory.mode = "safe"; }
        }
        if (!this.memory.sources) { this.memory.sources = {}; }
        if (!this.memory.assignedSources) { this.memory.assignedSources = {}; }
        if (!this.memory.assignedMinerals) { this.memory.assignedMinerals = {}; }
        if (!this.memory.enemies) { this.memory.enemies = {}; }
        if (!this.memory.targets) { this.memory.targets = []; }
        this.log("Successfully initiated room");
    }
};

Room.prototype.clearSites = function() {
    const sites = this.find(FIND_CONSTRUCTION_SITES);
    for (const s in sites) {
        sites[s].remove();
    }
    return OK;
};

/*
* Get a room's harvestable energy and cache it
*/
Room.prototype.collectableEnergy = function(): number {
    if (this.memory.lastEnergyCheck && this.memory.lastEnergyCheck === Game.time) {
        return this.memory.energy || 0;
    }
    let energy = 0;
    const containers: StructureContainer[] = this.find(FIND_STRUCTURES, {
        filter: (c: AnyStructure) => c.structureType === STRUCTURE_CONTAINER && c.store[RESOURCE_ENERGY] > 0
    }) as StructureContainer[];
    const resources = this.find(FIND_DROPPED_RESOURCES, {
        filter: (r: Resource) => r.resourceType === RESOURCE_ENERGY
    });
    if (containers.length > 0) {
        energy += _.sum(containers, (c: StructureContainer) => c.store[RESOURCE_ENERGY]);
    }
    if (resources.length > 0) {
        energy += _.sum(resources, (r: Resource) => r.amount);
    }
    this.memory.energy = energy;
    this.memory.lastEnergyCheck = Game.time;

    return this.memory.energy;
};

/*
* Get the hostiles in a room
*/
Room.prototype.hostiles = function(): number {
    if (this.memory.lastHostileCheck && this.memory.lastHostileCheck === Game.time) {
        return this.memory.hostiles || 0;
    }

    const hostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter: (i: Creep) => !(ALLIES.indexOf(i.owner.username) > -1)
    });
    this.memory.hostiles = hostiles.length;
    this.memory.lastHostileCheck = Game.time;

    return this.memory.hostiles;
};

/**
 * Count the enemies in a room and rank them based on threat
 */
Room.prototype.countEnemies = function(): string[] {
    if (this.memory.lastHostileCheck && this.memory.lastHostileCheck === Game.time) {
        return this.targets || [];
    }
    this.log("Counting enemies in ");
    const hostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter: (i: Creep) => !(ALLIES.indexOf(i.owner.username) > -1)
    });
    let targets = [];
    if (hostiles.length > 0) {
        let creep: Creep;
        for (creep of hostiles) {
            let threat = 0;
            threat += (creep.getActiveBodyparts(ATTACK) * 5);
            threat += (creep.getActiveBodyparts(HEAL) * 20);
            threat += (creep.getActiveBodyparts(RANGED_ATTACK) * 15);
            threat += creep.getActiveBodyparts(TOUGH);
            creep.threat = threat;
        }
        targets = _.pluck(_.sortByOrder(hostiles, "threat", "desc"), "id");
    } else {
        this.memory.enemies = {};
    }
    this.targets = targets;
    this.memory.hostiles = targets.length;
    this.memory.lastHostileCheck = Game.time;
    return this.targets;
};

Room.prototype.attackEnemiesWithTowers = function(): void {
    let towers: StructureTower[] = this.find(FIND_MY_STRUCTURES, {
        filter: (s: AnyStructure) => s.structureType === STRUCTURE_TOWER && s.energy > 0
    }) as StructureTower[];
    for (const t of this.targets) {
        const target: Creep | null = Game.getObjectById(t);
        // if no target, do nothing
        if (!target) { return; }
        // Sort towers by range to target
        towers = _.sortByOrder(towers, (tower: StructureTower) => {
            return tower.pos.getRangeTo(target);
        }, "asc");

        let hp = target.hits;
        for (const tower of towers) {
            if (hp <= 0) {
                continue;
            }
            let range = tower.pos.getRangeTo(target);
            let dmg = TOWER_POWER_ATTACK;
            if (range > TOWER_OPTIMAL_RANGE) {
                if (range > TOWER_FALLOFF_RANGE) {
                    range = TOWER_FALLOFF_RANGE;
                }
                // tslint:disable-next-line:max-line-length
                dmg -= dmg * TOWER_FALLOFF * (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);
            }
            dmg = Math.floor(dmg);
            hp -= dmg;
            tower.attack(target);
            // take out of the tower list
            // towers = _.remove(towers, (twr: StructureTower) => {
            //     return twr === tower;
            // });
        }
    }
};

/*
* Initiate Storage Drain of a room into GCL
*/
Room.prototype.drain = function(): void {
    this.log("[ADMIN] Initiating drain");
    this.memory.prioritise = "none";
    this.memory.charging = false;
    this.memory.links = true;
};

Room.prototype.stopDrain = function(): void {
    this.log("[ADMIN] Cancelling drain in ");
    this.memory.prioritise = "none";
    this.memory.charging = true;
    this.memory.links = false;
};

Room.prototype.processBuildFlags = function(): number {
    // If we have 100 (or more?) buildsites, ignore this entirely
    if (_.filter(Game.constructionSites, (site) => site.my).length >= 100) { return OK; }
    this.log("Checking for buildsites");
    // Get the buildsites in this room
    const sitecount = this.find(FIND_CONSTRUCTION_SITES);
    // If we have more than 1 site, don't add any more
    if (sitecount.length > 1) {
        this.log("Already too many buildsites in this room");
        return OK;
    }
    // Get the buildsite flags in this room
    const flags = _.filter(Game.flags, (flag) => flag.color === global.flagColor.buildsite &&
        flag.pos.roomName === this.name);
    // If there's no flags, no point carrying on
    if (flags.length === 0) {
        this.log("No buildsites found");
        return OK;
    }
    this.log("Found " + flags.length + " build sites");
    // Loop through the flags
    for (const i in flags) {
        const flag = flags[i];
        if (!flag) {
            this.log("Looped for too long or flag broke, forced break from buildsite loop");
            // console.log(JSON.stringify(flags));
            break;
        }
        // Get the first flag and check it's secondary colour
        const _pos = flag.pos;
        // Check for existing buildsite here
        const sites = this.lookForAt(LOOK_CONSTRUCTION_SITES, _pos);
        // Already something here... remove the flag
        if (sites.length > 0) {
            this.log("Already a buildsite there");
            flag.remove();
            return OK;
        }

        const structure = global.buildColor[flag.secondaryColor];
        this.log("Attempting to build " + structure);
        let result = this.createConstructionSite(_pos, structure);
        // If there's an error with this build site, remove it's flag so we don't try again later
        if (result === ERR_INVALID_TARGET || result === ERR_INVALID_ARGS) {
            this.log("Invalid flag, removing");
            // Remove the flag, we'll skip over to the next one instead
            flag.remove();
        }
        // If it workes lets feedback and remove the flag
        if (result === OK) {
            // Clear the flag
            flag.remove();
            // feedback
            this.log(structure + " Buildsite created");
            return OK;
        }
        // If we're full, just break the loop by changing the result to OK
        if (result === ERR_FULL) {
            this.log("Cannot make any more buildsites right now");
            result = OK;
            return OK;
        }
        // Is the room not high enough level yet? (We can try something else in the list instead)
        if (result === ERR_RCL_NOT_ENOUGH) {
            this.log("Skipped trying to place " + structure + " Because RCL");
        }
    }

    return OK;
};

/*
* Feed Energy Routine
*/
Room.prototype.feedEnergy = function(): void {
    // If we don't have a feedRoom, just return
    if (!Memory.feedRoom) { this.log("No feedRoom Set"); return; }
    // Do we have a terminal?
    if (!this.terminal) { this.log("No Terminal"); return; }
    // Is the terminal on cooldown
    if (this.terminal.cooldown > 0) {
        this.log("Terminal on cooldown" + JSON.stringify(this.terminal));
        return;
    }
    // Is this the feedroom?
    if (this.name === Memory.feedRoom) {
        this.log("This is the feedroom");
        // Make sure we're feeding the storage, not the terminal
        if (this.memory.prioritise !== "none") {
            this.memory.prioritise = "none";
        }
        return;
    }
    // Do we have memory of the target (save processing)
    if (!this.memory.feedTarget || this.memory.feedTarget.room !== Memory.feedRoom) {
        this.log("Needs a Target");
        // Run some setup
        this.setupFeedTarget();
    }
    if (!this.memory.feedTarget || !this.memory.feedTarget.chunk) {
        return;
    }
    // only feed if we have more than 200k energy in storage (otherwise we flip about too much)
    if (this.storage && this.storage.store[RESOURCE_ENERGY] > 200000) {
        // Does the terminal have enough energy?
        if (this.terminal && this.terminal.store[RESOURCE_ENERGY] < this.memory.feedTarget.chunk) {
            this.memory.prioritise = "terminal";
            this.log("Charging Terminal");
            return;
        }
    } else {
        this.log("Below Minimum Storage Energy Level");
        this.memory.prioritise = "none";
        return;
    }
    this.log("Chunk " + this.memory.feedTarget.chunk);
    this.log("Terminal store " + this.terminal.store[RESOURCE_ENERGY]);
    // Get the multiplier
    const multiplier = Math.round((this.terminal.store[RESOURCE_ENERGY] / Number(this.memory.feedTarget.chunk)));
    this.log("Multiplier " + multiplier);
    // now get the total we want to send
    const total = (multiplier * 1000);
    this.log("Total " + total);
    // Alright, send it
    const msg = "Feeding [" + this.memory.feedTarget + "]";
    const response = this.terminal.send(RESOURCE_ENERGY, total, String(this.memory.feedTarget.room), msg);
    this.log("Feeding Target with " + total + " energy " + response);
};

/*
 * Setup a room's feed target
 */
Room.prototype.setupFeedTarget = function(): void {
    const cost = Game.market.calcTransactionCost(1000, this.name, Memory.feedRoom);
    const chunk = cost + 1000;
    const feedTarget: { [k: string]: any } = {};
    feedTarget.room = Memory.feedRoom;
    feedTarget.chunk = chunk;
    this.memory.feedTarget = feedTarget;
    console.log("[EMPIRE][" + this.name + "] Feed Target Set: " + JSON.stringify(this.memory.feedTarget));
};

/**
 * Setup the energy sources in a room and decide how many miners it needs
 */
Room.prototype.sourceSetup = function(): void {
    this.log("Setting up energy sources");
    delete this.memory.assignedSources;
    // get the sources in this room
    const sources: Source[] = this.find(FIND_SOURCES);
    // get the miners in this room
    const creeps: Creep[] = _.filter(Game.creeps, (c: Creep) =>
        ((c.role === Miner.roleName && c.memory.roomName === this.name) ||
            (c.role === RemoteEnergyMiner.roleName && c.memory.remoteRoom === this.name)) &&
        !c.memory.dying);
    // set the number of minersNeeded to the length of sources
    this.memory.minersNeeded = sources.length;
    // make an empty array
    const roomSources: { [key: string]: string | null } = {};
    // loop through the sources
    for (const i in sources) {
        this.log("Clearing source association for " + sources[i].id);
        // set the source to null first
        roomSources[sources[i].id] = null;
        // loop through the creeps we found
        for (const c in creeps) {
            // grab the creep
            const Creep = creeps[c];
            this.log("Checking creep" + Creep.name);
            // if this creep is assigned to this source
            if (Creep.memory.assignedSource === sources[i].id) {
                this.log("Assigning " + sources[i].id + " to creep " + Creep.name);
                // update this source to this creepid
                roomSources[sources[i].id] = Creep.id;
                delete creeps[c];
            }
        }
    }
    this.log(JSON.stringify(roomSources));
    // update the room's assigned sources
    this.memory.assignedSources = roomSources;
};

/**
 * Setup the mineral sources in a room and decide how many extractors it needs
 */
Room.prototype.mineralSetup = function(): void {
    this.log("Setting up Mineral sources");
    delete this.memory.assignedMinerals;
    // get the extractors
    const minerals = this.find(FIND_MINERALS, {
        filter: (i: Mineral) => (
            i.mineralAmount > 0 || i.ticksToRegeneration <= ((50 * 3) + MineralExtractor.ticksBeforeRenew)
        )
    });
    if (minerals.length === 0) {
        this.memory.mineralsNeeded = 0;
        return;
    }
    const creeps = _.filter(Game.creeps, (c: Creep) =>
        c.role === MineralExtractor.roleName && c.memory.roomName === this.name &&
        // @todo Remote Mineral Extractor role name?
        !c.memory.dying);
    const mineral: Mineral = _.first(minerals);
    const spaces: number = mineral.pos.numSpacesAround(undefined, true);
    this.log("Found " + spaces + " available spaces");
    // get the mineral extracters in this room

    // set the number of mineralsNeeded to thelength of active mineral sites
    this.log("Found " + creeps.length + " Creeps to fill the spaces");
    this.memory.mineralsNeeded = spaces - creeps.length;
};

/**
 * Loop through the available roles and check enabled
 */
Room.prototype.roleSetup = function(): void {
    // Make sure we initialise the room memory
    if (!this.memory.roles) {
        this.log("Creating room role object");
        this.memory.roles = {};
    }
    let role: Role;
    // Loop through ROLEMODELS
    for (role of ROLEMODELS) {
        this.log("Checking if " + role.roleName + " enabled");
        this.memory.roles[role.roleName] = role.enabled(this);
    }
};
/**
 * Returns list of creeps of a certain role
 */
Room.prototype.activeCreepsInRole = function(Role: CreepRole): Creep[] {
    const list: Creep[] = _.filter(Game.creeps, (c: Creep) =>
        c.memory.role === Role.roleName &&
        c.memory.roomName === this.name &&
        !c.memory.dying);
    return list;
};

Room.prototype.runTowers = function(): number {
    // record cpu use before we go
    const start = Game.cpu.getUsed();
    // get towers in this room
    const towers = this.find(FIND_MY_STRUCTURES, {
        filter: (s: AnyStructure) => s.structureType === STRUCTURE_TOWER && s.energy > 0
    }) as StructureTower[];
    // if we have any
    if (towers.length > 0) {
        // loop
        for (const i in towers) {
            // get the tower
            const tower: StructureTower = towers[i];
            // run it
            if (tower.run() === false) {
                return Game.cpu.getUsed() - start;
            }
        }
    }
    return Game.cpu.getUsed() - start;
};
