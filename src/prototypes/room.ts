import { ROLEMODELS, ROLES } from "config/constants";
import { ALLIES } from "config/diplomacy";
import { Debug } from "functions/debug";
import { visualiseDamage } from "functions/tools";
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
            if (!this.memory.links) { this.memory.links = false; }
            if (!this.memory.prioritise) { this.memory.prioritise = "none"; }
            if (!this.memory.wallMax) { this.memory.wallMax = 10000; }
            if (!this.memory.rampartMax) { this.memory.rampartMax = 10000; }
            if (!this.memory.roles) { this.memory.roles = {}; }
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

Room.prototype.checkDefenceMax = function(): void {
    // our room, max level with storage
    if (this.controller && this.controller.my && this.controller.level === 8 && this.storage) {
        if (this.storage.store[RESOURCE_ENERGY] >= 700000 || this.memory.charging === false) {
            this.log("Checking defence numbers");
            const walls: StructureWall[] = this.find(FIND_STRUCTURES, {
                filter: (c: AnyStructure) => c.structureType === STRUCTURE_WALL
            }) as StructureWall[];
            const wallAvg = _.sum(walls, (c) => c.hits) / walls.length;
            const wallMax = this.memory.wallMax || global.wallMax || Memory.wallMax;
            if (wallAvg > wallMax) {
                this.log("Increasing wallmax");
                this.memory.wallMax = wallMax * 1.1;
            }

            const ramparts: StructureRampart[] = this.find(FIND_STRUCTURES, {
                filter: (c: AnyStructure) => c.structureType === STRUCTURE_RAMPART
            }) as StructureRampart[];
            const ramAvg = _.sum(ramparts, (c) => c.hits) / ramparts.length;
            const ramMax = this.memory.rampartMax || global.rampartMax || Memory.rampartMax;
            // Always reduce the rampart max down a little since they decay
            if (ramAvg > ramMax * 0.95) {
                this.log("Increasing rampartmax");
                this.memory.rampartMax = ramMax * 1.1;
            }
        }
    }
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

/**
 * Process, and subsequently remove deconstruction flags
 */
Room.prototype.processDeconFlags = function(): void {
    // Initialise the memory
    if (!this.memory.deconTargets) { this.memory.deconTargets = []; }
    // Filter the room for flags with decon colours
    const flags: Flag[] = _.filter(Game.flags, (flag) =>
        flag.pos.roomName === this.name &&
        flag.color === COLOR_RED && flag.secondaryColor === COLOR_ORANGE
    );
    // No flags, nothing to do
    if (flags.length === 0) {
        this.log("No Decon Flags Found");
        return;
    }
    this.log("Found " + flags.length + " decon flags");
    for (const flag of flags) {
        const items = this.lookForAt(LOOK_STRUCTURES, flag.pos);
        for (const item of items) {
            item.notifyWhenAttacked(false);
            this.memory.deconTargets.push(item.id);
        }
        // Bin the flag
        flag.remove();
    }
};

/**
 * Returns a list of the decon items from memory
 */
Room.prototype.getDeconList = function(): string[] {
    if (!this.memory.deconTargets) { this.memory.deconTargets = []; }
    return this.memory.deconTargets || [];
};

/**
 * Gets the list of decon ids and converts into game objects
 */
Room.prototype.getDeconItems = function(): Structure[] {
    const structures = _.filter(this.getDeconList(), (id) => {
        const obj = Game.getObjectById(id);
        if (obj) { return true; }
        return false;
    });
    this.memory.deconTargets = structures;
    if (structures.length === 0) { return []; }
    // Return the mapped items
    return _.map(structures, (id) => Game.getObjectById(id)) as Structure[];
};

/**
 * Visualise the damage of the structures we want to remove
 */
Room.prototype.visualiseDecons = function(): void {
    const structures: Structure[] = this.getDeconItems();
    if (structures.length === 0) { return; } // Nothing to do
    visualiseDamage(structures, this, "> ", " <");
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

Room.prototype.chargeTerminalOverride = function(): void {
    this.memory.prioritise = "terminal";
    this.memory.override = true;
};

Room.prototype.cancelTerminalOverride = function(): void {
    this.memory.prioritise = "none";
    delete this.memory.override;
};

Room.prototype.runBoostLab = function(): void {
    const boostLab = _.first(this.find(FIND_MY_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_LAB &&
            s.labType === "booster" &&
            s.mineralAmount > 0
    })) as StructureLab;
    if (!boostLab) {
        return;
    }
    // okay now find spawns nearby spawning something
    const boostTarget: BoostTarget | null = boostLab.boostTarget ? boostLab.boostTarget : null;
    if (boostTarget) {
        // Get nearby spawns that are spawning!
        const spawns = this.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_SPAWN &&
            s.spawning !== null
        }) as StructureSpawn[];
        for (const spawn of spawns) {
            if (!spawn.spawning) {
                continue;
            }
            const creep: Creep = Game.creeps[spawn.spawning.name];
            if (creep.role === boostTarget.roleName) {
                if (creep.boosted === false) {
                    if (boostLab.boostCreep(creep) === OK) {
                        creep.boosted = true;
                        boostLab.room.visual.text(
                            "Boost", boostLab.pos, {
                                align: "center",
                                color: "#b200ff",
                                font: 0.5,
                                opacity: 0.6,
                                stroke: "rgba(0,0,0,0.5)"
                            }
                        );
                    }
                }
            }
        }
    }
};

Room.prototype.runReactionLabs = function(): void {
    const sourceLabs = this.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_LAB &&
        s.labType === "feeder" &&
        s.mineralAmount > 0
    }) as StructureLab[];
    if (sourceLabs.length === 0) {
        return;
    }
    for (const lab of sourceLabs) {
        lab.room.visual.text(
            lab.mineralType || "?", lab.pos, {
                align: "center",
                color: "#000000",
                font: 0.4,
                opacity: 0.8,
                stroke: "rgba(0,0,0,0.1)"
            }
        );
    }
    const reactionLabs = this.find(FIND_MY_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_LAB &&
            s.labType === "reactor" &&
            s.mineralAmount < s.mineralCapacity &&
            s.cooldown <= 0 &&
            s.reaction !== null
    }) as StructureLab[];
    if (reactionLabs.length === 0) {
        return;
    }

    for (const lab of reactionLabs) {
        const reaction: LabReaction | null = lab.reaction ? lab.reaction : null;
        if (!reaction) {
            continue;
        }
        // we have a reaction
        const lab1 = reaction.sourceLab1;
        const lab2 = reaction.sourceLab2;
        const target = reaction.targetLab;
        if (target !== lab) {
            this.log("Something went wrong with reaction");
            continue;
        }
        if (lab2.mineralAmount < 5 || lab1.mineralAmount < 5) {
            this.log("Not enough source minerals");
            continue;
        }
        const result = lab.runReaction(lab1, lab2);
        if (result === OK) {
            this.log("Lab Reaction complete");
            lab.room.visual.text(
                lab.mineralType || "!!", lab.pos, {
                    align: "center",
                    color: "#ffffff",
                    font: 0.4,
                    opacity: 0.8,
                    stroke: "rgba(0,0,0,0.1)"
                }
            );
            continue;
        }
        this.log("Lab reaction result " + result.toString());
    }
};

Room.prototype.emptyLabs = function(): void {
    const labs = this.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_LAB
    }) as StructureLab[];
    for (const lab of labs) {
        lab.emptyMe = true;
    }
};

Room.prototype.cancelEmptyLabs = function(): void {
    const labs = this.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_LAB
    }) as StructureLab[];
    for (const lab of labs) {
        lab.emptyMe = false;
    }
};

Room.prototype.boost = function(role: Role, compound: _ResourceConstantSansEnergy): void {
    const lab = _.first(this.find(FIND_MY_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_LAB &&
            s.labType === "booster"
    })) as StructureLab;
    lab.boostTarget = {
        compound,
        roleName: role.roleName
    };
    lab.compoundIn = compound;
    lab.emptyMe = false;
};

Room.prototype.clearBoost = function(): void {
    const lab = _.first(this.find(FIND_MY_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_LAB &&
            s.labType === "booster"
    })) as StructureLab;

    lab.boostTarget = undefined;
    lab.compoundIn = undefined;
    lab.mineralIn = undefined;
    lab.emptyMe = true;
};

Room.prototype.beginReaction = function(
    input1: _ResourceConstantSansEnergy,
    input2: _ResourceConstantSansEnergy
): void {
    this.log("Setting up reaction of " + input1 + ":" + input2);
    // TODO: Cache this
    const feeders = this.find(FIND_MY_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_LAB &&
            s.labType === "feeder"
    }) as StructureLab[];
    const feederLab1 = _.first(feeders);
    const feederLab2 = _.last(feeders);

    this.log("Feeder lab 1: " + feederLab1.id);
    this.log("Feeder lab 2: " + feederLab2.id);

    feederLab1.compoundIn = input1;
    feederLab1.emptyMe = false;
    feederLab2.compoundIn = input2;
    feederLab2.emptyMe = false;
    // TODO: Cache this
    const reactors = this.find(FIND_MY_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_LAB &&
            s.labType === "reactor"
    }) as StructureLab[];
    for (const reactor of reactors) {
        const reaction: LabReaction = {
            targetLab: reactor,
            // tslint:disable-next-line:object-literal-sort-keys
            sourceLab1: feederLab1,
            sourceLab2: feederLab2
        };
        reactor.reaction = reaction;
        reactor.emptyMe = false;
        this.log("Reactor lab " + reactor.id + " Started");
    }
    // TODO: Check for and request inputs?
};

Room.prototype.clearReaction = function(): void {
    const feeders = this.find(FIND_MY_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_LAB &&
            s.labType === "feeder"
    }) as StructureLab[];

    for (const feeder of feeders) {
        feeder.compoundIn = undefined;
        feeder.mineralIn = undefined;
        feeder.emptyMe = true;
        this.log("Feeder lab " + feeder.id + " cleared");
    }

    const reactors = this.find(FIND_MY_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_LAB &&
            s.labType === "reactor"
    }) as StructureLab[];

    for (const reactor of reactors) {
        reactor.reaction = undefined;
        reactor.emptyMe = true;
        this.log("Reactor Lab " + reactor.id + " cleared");
    }
};
