import { ROLES } from "config/constants";
import { ALLIES } from "config/diplomacy";
import { Debug } from "functions/debug";
import { Builder } from "roles/Builder";
import { Harvester } from "roles/Harvester";
import { Miner } from "roles/Miner";
import { Refiller } from "roles/Refiller";
import { RemoteEnergyHauler } from "roles/RemoteEnergyHauler";
import { RemoteEnergyMiner } from "roles/RemoteEnergyMiner";
import { RemoteReserver } from "roles/RemoteReserver";
import { Supergrader } from "roles/Supergrader";
import { Upgrader } from "roles/Upgrader";

export function loadRoomPrototypes(): void {
    Debug.Load("Prototype: Room");

    Room.prototype.log = function(msg: string): void {
        Debug.Room(msg, this);
    };

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
            } else {
                if (!this.memory.mode) { this.memory.mode = "safe"; }
            }
            if (!this.memory.sources) { this.memory.sources = {}; }
            if (!this.memory.assignedSources) { this.memory.assignedSources = []; }
            if (!this.memory.assignedMinerals) { this.memory.assignedMinerals = []; }
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
            return this.memory.energy;
        }
        let energy = 0;
        const containers = this.find(FIND_STRUCTURES, {
            filter: (c: AnyStructure) => c.structureType === STRUCTURE_CONTAINER && c.store[RESOURCE_ENERGY] > 0
        });
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
            return this.memory.hostiles;
        }

        const hostiles = this.find(FIND_HOSTILE_CREEPS, {
            filter: (i: Creep) => !(ALLIES.indexOf(i.owner.username) > -1)
        });
        this.memory.hostiles = hostiles.length;
        this.memory.lastHostileCheck = Game.time;

        return this.memory.hostiles;
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
                // console.log(JSON.stringify(flag));
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
        // only feed if we have more than 200k energy in storage (otherwise we flip about too much)
        if (this.storage.store[RESOURCE_ENERGY] > 200000) {
            // Does the terminal have enough energy?
            if (this.terminal.store[RESOURCE_ENERGY] < this.memory.feedTarget.chunk) {
                this.memory.prioritise = "terminal";
                this.log("Charging Terminal");
                return;
            }
        } else {
            this.log("Below Minimum Storage Energy Level");
            this.memory.prioritise = "none";
            return;
        }

        // Get the multiplier
        const multiplier = (this.terminal.store[RESOURCE_ENERGY] / this.memory.feedTarget.chunk);
        // now get the total we want to send
        const total = (multiplier * 1000).toFixed();
        // Alright, send it
        const msg = "Feeding [" + this.memory.feedTarget + "]";
        this.terminal.send(RESOURCE_ENERGY, total, this.memory.feedTarget.room, msg);
        this.log("Feeding Target");
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
        const roomSources: {[key: string]: string | null} = {};
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
            filter: (i: Mineral) => i.mineralAmount > 0
        });
        // get the mineral extracters in this room
        const creeps = _.filter(Game.creeps, (c: Creep) =>
            c.role === "Extractor" &&
            c.memory.roomName === this.name &&
            !c.memory.dying);
        // set the number of mineralsNeeded to thelength of active mineral sites
        this.memory.mineralsNeeded = minerals.length;
        // make an empty array
        const roomMinerals: any = {};
        // loop through the minerals
        for (const i in minerals) {
            this.log("Clearing mineral association for " + minerals[i].id);
            // set the mineral to null
            roomMinerals[minerals[i].id] = null;
            // loop through the creeps we found
            for (const c in creeps) {
                // grab the creep
                const Creep = creeps[c];
                this.log("Checking creep" + Creep.name);
                // if this assigned to the mineral
                if (Creep.memory.assignedMineral === minerals[i].id) {
                    this.log("Assigning " + minerals[i].id + " to creep" + Creep.name);
                    // update this source to this creepId
                    roomMinerals[minerals[i].id] = Creep.id;
                    delete creeps[c];
                }
            }
        }
        this.log(JSON.stringify(roomMinerals));
        // update the room's assigned minerals
        this.memory.assignedMinerals = roomMinerals;
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
        // Loop through the roles we have
        for (const i in ROLES) {
            // Get the role name
            const roleName: string = ROLES[i];
            this.log("Checking if " + roleName + " Enabled");
            // switch based on the roleName
            switch (roleName) {
                // Miners
                case Miner.roleName:
                    this.memory.roles[roleName] = Miner.enabled(this);
                    break;
                // Harvesters
                case Harvester.roleName:
                    this.memory.roles[roleName] = Harvester.enabled(this);
                    break;
                // Upgraders
                case Upgrader.roleName:
                    this.memory.roles[roleName] = Upgrader.enabled(this);
                    break;
                // Supergraders
                case Supergrader.roleName:
                    this.memory.roles[roleName] = Supergrader.enabled(this);
                    break;
                // Builders
                case Builder.roleName:
                    this.memory.roles[roleName] = Builder.enabled(this);
                    break;
                // Refillers
                case Refiller.roleName:
                    this.memory.roles[roleName] = Refiller.enabled(this);
                    break;
                // Reservers
                case RemoteReserver.roleName:
                    this.memory.roles[roleName] = RemoteReserver.enabled(this);
                    break;
                // Remote Energy Miners
                case RemoteEnergyMiner.roleName:
                    this.memory.roles[roleName] = RemoteEnergyMiner.enabled(this);
                    break;
                // Haulers
                case RemoteEnergyHauler.roleName:
                    this.memory.roles[roleName] = RemoteEnergyHauler.enabled(this);
                    break;
                // default
                default:
                    this.memory.roles[roleName] = false;
                    break;
            }
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
        });
        // if we have any
        if (towers.length > 0) {
            // loop
            for (const i in towers) {
                // get the tower
                const tower: StructureTower = towers[i];
                // run it
                tower.run();
            }
        }
        return Game.cpu.getUsed() - start;
    };
}
