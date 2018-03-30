import { ALLIES } from "config/diplomacy";
import { Debug } from "functions/debug";

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
            if (!this.memory.assignedSources) { this.memory.assignedSources = {}; }
            if (!this.memory.assignedExtractors) { this.memory.assignedExtractors = {}; }
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
}
