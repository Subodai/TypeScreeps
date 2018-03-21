import { Debug } from "functions/debug";
import { Traveler } from "utils/Traveler";

/**
 * Creep Prototype Extension
 */
export function loadCreepPrototypes(): void {
    // Some debug
    Debug.Log("Loading Creep Prototype");

    /**
     * Log Handler to make it tidier
     */
    Creep.prototype.log = function(msg: string): void {
        Debug.creep(msg, this);
    };

    /**
     * Is Creep Tired
     * @return boolean
     */
    Creep.prototype.isTired = function(): boolean {
        return this.spawning || this.fatigue > 0;
    };

    /**
     * Clear creep memory
     * @return void
     */
    Creep.prototype.clearTargets = function(): void {
        const mem: CreepMemory = {
            level: this.memory.level,
            role: this.memory.role,
            roomName: this.memory.roomName,
            sType: this.memory.sType
        };
        this.memory = mem;
        this.log("Target Reset");
    };

    /**
     * Can this creep do work tasks?
     */
    Creep.prototype.canWork = function(): boolean {
        // Has this creep already been flagged as a worker? and at full health
        // (if it's been hit we should check it's parts again)
        if (!this.memory.canWork && this.hits === this.hitsMax) {
            // If we got hit, clear the memory
            if (this.hits !== this.hitsMax) { delete this.memory.canWork; }
            // Use the activeBodyparts method.. sigh
            if (this.getActiveBodyparts(WORK) > 0) {
                this.memory.canWork = "yes";
            }
            // Is it set at this point?
            if (!this.memory.canWork) {
                // Set it to no
                this.memory.canWork = "no";
            }
        } else {
            return this.canDo(WORK);
        }
        // Can this creep work?
        return this.memory.canWork === "yes";
    };

    /*
    * Does a creep have any active BodyParts of type sent?
    * @param BodyPart Creep.body.part
    */
    Creep.prototype.canDo = function(bodyPart: BodyPartConstant): boolean {
        // If this creep needs a bodypart it doesn't have to function properly,
        // it needs to go home to repair or self repair
        if (!(this.getActiveBodyparts(bodyPart) > 0) || this.memory.repair) {
            // Creep is damaged, say so!
            this.say("DMGD");
            // Do we have our own heal parts?
            if (this.getActiveBodyparts(HEAL) > 0) {
                // Heal ourselves
                this.heal(this);
            } else {
                // Get position in centre of home room
                if (this.memory.roomName) {
                    const pos: RoomPosition = new RoomPosition(25, 25, this.memory.roomName);
                    // Move the creep
                    this.travelTo(pos);
                }
            }
            // Are we at max health?
            if (this.hits >= this.hitsMax) {
                delete this.memory.repair;
                return true;
            } else {
                this.memory.repair = true;
                return false;
            }
        }
        return true;
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
                return true;
            }
        }
        this.log("First check for space at source");
        let spaces = 1;
        const n: RoomPosition = new RoomPosition(source.pos.x, source.pos.y - 1, source.pos.roomName);
        if (this.checkEmptyAtPos(n)) { spaces++; }
        const ne: RoomPosition = new RoomPosition(source.pos.x + 1, source.pos.y - 1, source.pos.roomName);
        if (this.checkEmptyAtPos(ne)) { spaces++; }
        const e: RoomPosition = new RoomPosition(source.pos.x + 1, source.pos.y, source.pos.roomName);
        if (this.checkEmptyAtPos(e)) { spaces++; }
        const se: RoomPosition = new RoomPosition(source.pos.x + 1, source.pos.y + 1, source.pos.roomName);
        if (this.checkEmptyAtPos(se)) { spaces++; }
        const s: RoomPosition = new RoomPosition(source.pos.x, source.pos.y + 1, source.pos.roomName);
        if (this.checkEmptyAtPos(s)) { spaces++; }
        const sw: RoomPosition = new RoomPosition(source.pos.x - 1, source.pos.y + 1, source.pos.roomName);
        if (this.checkEmptyAtPos(sw)) { spaces++; }
        const w: RoomPosition = new RoomPosition(source.pos.x - 1, source.pos.y, source.pos.roomName);
        if (this.checkEmptyAtPos(w)) { spaces++; }
        const nw: RoomPosition = new RoomPosition(source.pos.x - 1, source.pos.y - 1, source.pos.roomName);
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
        } else {
            const creeps: Creep[] = pos.lookFor(LOOK_CREEPS);
            if (creeps.length === 0) {
                this.log("Space found at " + JSON.stringify(pos));
                return true;
            } else {
                // is this, the creep we're trying to find a space for
                if (creeps[0] === this) {
                    this.log("We are at " + JSON.stringify(pos));
                    return true;
                } else {
                    this.log("Other creep [" + creeps[0].name + "] found at " + JSON.stringify(pos));
                    return false;
                }
            }
        }
    };

    /**
     * Find and collect nearby energy
     *
     * @param useStorage bool
     * @param emergency bool
     */
    Creep.prototype.getNearbyEnergy = function(useStorage: boolean = false, emergency: boolean = false): number {
        // First, are we full?
        if (_.sum(this.carry) === this.carryCapacity) {
            this.log("Creep Full Cannot Get Nearby Energy");
            // Clear our pickup target
            delete this.memory.energyPickup;
            return ERR_FULL;
        }
        /* Are we near a link with memory of receiver limit to only upgraders or supergraders,
        otherwise refillers become.. interesting*/
        if (!this.memory.energyPickup && (this.memory.role === "upgrader" || this.memory.role === "supergrader")) {
            this.log("Checking for links");
            // If we're in our own room, with our own controller, above level 5 (should have links)
            if (this.room.controller && this.room.controller.my && this.room.controller.level >= 5) {
                this.log("Links available");
                // Lets find the nearest link with energy that has the right flag
                const links: Structure[] = this.room.find(FIND_STRUCTURES, {
                    filter: (i) => i.structureType === STRUCTURE_LINK &&
                                   i.memory.linkType === "receiver" && i.energy > 0
                });
                if (links.length > 0) {
                    // Temporary creep object
                    const thisCreep: Creep = this;
                    // get the nearest one
                    const link: Structure = _.min(links, (l) => thisCreep.pos.getRangeTo(l));
                    // Set it to memory
                    this.memory.energyPickup = link.id;
                } else {
                    if (this.room.memory.links === true) {
                        // just wait don't run off, return nothing
                        return OK;
                    }
                }
            }
        }

        // Storage override
        if (!this.memory.energyPickup) {
            // Only pull from Terminal if we aren't prioritising it
            if (useStorage && this.room.terminal &&
                (!this.room.memory.prioritise || this.room.memory.prioritise !== "terminal")) {
                if (this.room.terminal.store[RESOURCE_ENERGY] > 0) {
                    this.memory.energyPickup = this.room.terminal.id;
                }
            }
            if (!this.memory.energyPickup) {
                if (useStorage && this.room.storage &&
                    (!this.room.memory.prioritise || this.room.memory.prioritise !== "storage")) {
                    if (this.room.storage.store[RESOURCE_ENERGY] > 0) {
                        this.memory.energyPickup = this.room.storage.id;
                    }
                }
            }
        }
        if (!this.memory.energyPickup) {
            this.log("Creep has no memory, finding stuff to pickup");
            // If this is an emergency we should be going for the terminal, then storage
            if (emergency) {
                // TODO EMPTY TERMINAL AND STORAGE HERE PLEASE
            }
            // Get dropped resources in the room
            const resources: Resource[] = this.room.find(FIND_DROPPED_RESOURCES, {
                filter: (i) => i.resourceType === RESOURCE_ENERGY &&
                               i.amount > (this.carryCapacity - _.sum(this.carry)) / 4
            });
            // Get Containers in the room
            const containers: Structure[] = this.room.find(FIND_STRUCTURES, {
                filter: (i) => i.structureType === STRUCTURE_CONTAINER &&
                               i.store[RESOURCE_ENERGY] > (this.carryCapacity - _.sum(this.carry)) / 4
            });
            // False some things
            let resource: Resource | boolean = false;
            let container: Structure | boolean = false;
            const thisCreep: Creep = this;
            // If we have resources
            if (resources.length > 0) {
                this.log("Found " + resources.length + " resource piles");
                resource = _.max(resources, (r) => r.amount / thisCreep.pos.getRangeTo(r));
            }
            // if we have containers
            if (containers.length > 0) {
                this.log(" Found " + containers.length + " containers");
                container = _.max(containers, (c: StructureContainer) =>
                            c.store[RESOURCE_ENERGY] / thisCreep.pos.getRangeTo(c));
            }
            // If we have both we need to pick the closest one
            if (resource && container) {
                // If the resource is closer
                if (this.pos.getRangeTo(resource) < this.pos.getRangeTo(container)) {
                    this.log("Stored resource pile " + resource.id + " in memory");
                    this.memory.energyPickup = resource.id;
                } else {
                    this.log("Stored container " + container.id + " in memory");
                    this.memory.energyPickup = container.id;
                }
            } else if (resource) {
                this.log("Stored resource pile " + resource.id + " in memory");
                this.memory.energyPickup = resource.id;
            } else if (container) {
                this.log("Stored container " + container.id + " in memory");
                this.memory.energyPickup = container.id;
            }
            if (this.memory.role === "builder" || this.memory.level <= 2) {
                // Nothing found? lets try finding available sources
                if (!this.memory.energyPickup) {
                    // Can this creep work?
                    if (this.canWork() && this.memory.role !== "refiller") {
                        this.log("Can work, finding sources");
                        const source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
                            filter: (i) => {
                                if (i.energy > 0 || i.ticksToRegeneration < 10) {
                                    const space = thisCreep.findSpaceAtSource(i);
                                    return space;
                                } else {
                                    return false;
                                }
                            }
                        });
                        if (source) {
                            this.log("Stored Source " + source.id + " in memory");
                            this.memory.energyPickup = source.id;
                        }
                    }
                }
            }
        }
        // Do we have a target?
        if (this.memory.energyPickup) {
            this.log("Found energy source in memory " + this.memory.energyPickup);
            // We do! let's grab it
            const target = Game.getObjectById(this.memory.energyPickup);
            if (!target) {
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            let pickupSuccess: boolean = true;
            // Alright what is it?
            if (target instanceof Resource) { // Resource
                this.log("Target is a resource");
                // Is there still enough of it?
                if (target.amount <= 0 /* (this.carryCapacity - _.sum(this.carry))/4*/) {
                    this.log("Resource no longer viable, clearing memory");
                    // Target has gone, clear memory
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Only bother trying to pick up if we're within 1 range
                if (this.pos.inRangeTo(target, 1)) {
                    this.log("Target should be in range, attempting pickup");
                    // First attempt to pickitup
                    if (this.pickup(target) === ERR_NOT_IN_RANGE) {
                        this.log("Pickup failed");
                        pickupSuccess = false;
                    }
                } else {
                    this.log("Target not in range");
                    pickupSuccess = false;
                }
            } else if (target instanceof StructureContainer ||
                       target instanceof StructureStorage ||
                       target instanceof StructureTerminal) { // Container, Storage, Terminal
                this.log("Target is Container, Storage or Terminal");
                // Check the container still has the energy
                if (target.store[RESOURCE_ENERGY] <= 0 /* (this.carryCapacity - _.sum(this.carry))/4*/) {
                    this.log("Target no longer has enough energy, clearing memory");
                    // Clear memory and return invalid target
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Only bother trying to pick up if we're within 1 range
                if (this.pos.inRangeTo(target, 1)) {
                    this.log("Target should be in range, attempting withdraw");
                    // Lets attempt to withdraw
                    if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        this.log("Withdraw failed");
                        pickupSuccess = false;
                    }
                } else {
                    this.log("Target not in range");
                    pickupSuccess = false;
                }
            } else if (target instanceof StructureLink) { // Link
                this.log("Target is a link");
                // Check the container still has the energy
                if (target.energy === 0) {
                    this.log("Target no longer has enough energy, clearing memory");
                    // Clear memory and return invalid target
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Only bother trying to pick up if we're within 1 range
                if (this.pos.inRangeTo(target, 1)) {
                    this.log("Target should be in range, attempting withdraw");
                    // Lets attempt to withdraw
                    if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        this.log("Withdraw failed");
                        pickupSuccess = false;
                    }
                } else {
                    this.log("Target not in range");
                    pickupSuccess = false;
                }

            } else if (target instanceof Source) { // Source
                if (this.memory.role !== "builder" && this.memory.level >= 2) {
                    delete this.memory.energyPickup;
                }
                if (!this.canWork()) {
                    // no clear the memory
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Does it still have energy ?
                if (target.energy === 0) {
                    this.log("Source no longer has energy, clearing memory");
                    // no clear the memory
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Check for space
                if (!this.findSpaceAtSource(target)) {
                    this.log("Source no longer has space, clearing memory");
                    // no clear the memory
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Only bother trying to pick up if we're within 1 range
                if (this.pos.inRangeTo(target, 1)) {
                    this.log("Target should be in range, attempting harvest");
                    // Alright lets try harvesting it
                    if (this.harvest(target) === ERR_NOT_IN_RANGE) {
                        this.log("Harvest failed");
                        pickupSuccess = false;
                    }
                } else {
                    this.log("Target not in range");
                    pickupSuccess = false;
                }
            } else {
                // Something went wrong, or what we wanted to pickup has disapeared...
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Did we successfully pick up the thing
            if (pickupSuccess) {
                this.log("Successfully gathered resources");
                // Are we now full?
                if (this.carry.energy === this.carryCapacity) {
                    this.log("Creep is now full clearing pickup memory");
                    // Alright we're full clear memory and return full
                    delete this.memory.energyPickup;
                    return ERR_FULL;
                }
                // Just return OK, we're not full yet
                return OK;
            } else {
                this.log("Moving closer to target");
                // We probably need to move
                this.travelTo(target);
                return OK;
            }
        }
        return ERR_BUSY;
    };

    /**
     * Get Nearby minerals to pickup
     */
    Creep.prototype.getNearbyMinerals = function(storage: boolean = false): number {
        // First are we full?
        if (this.full()) {
            this.log("Creep full cannot get nearby minerals");
            // Clear the pickup target
            this.invalidateMineralTarget(true);
        }
        if (!this.memory.mineralPickup && storage) { this.findStorageMinerals(); }
        // Start with ground minerals
        if (!this.memory.mineralPickup) { this.findGroundMinerals(); }
        // Next Container Minerals
        if (!this.memory.mineralPickup) { this.findContainerMinerals(); }
        // Do we have a target?
        if (this.memory.mineralPickup) { return this.moveToAndPickupMinerals(); }
        // No target return not found
        return ERR_NOT_FOUND;
    };

    Creep.prototype.invalidateMineralTarget = function(full: boolean = false): number {
        delete this.memory.mineralPickup;
        if (full) { return ERR_FULL; }
        return ERR_INVALID_TARGET;
    };

    Creep.prototype.findStorageMinerals = function(): void {
        // Have an override, call it storeMinerals for now (it'l do)
        if (this.room.memory.storeMinerals) { return; }
        const storage = this.room.storage;
        // Does this room have a storage? (no harm in checking)
        if (storage) {
            // Is there something other than energy in the storage?
            if (_.sum(storage.store) - storage.store[RESOURCE_ENERGY] > 0) {
                // Set the target to be the storage
                this.memory.mineralPickup = storage.id;
            }
        }
    };

    Creep.prototype.findGroundMinerals = function(): void {
        let resource: boolean | Resource = false;
        const thisCreep = this;
        this.log("Creep has no mineral memory, finding stuff to pickup");
        // First check for nearby dropped resources
        const resources = this.room.find(FIND_DROPPED_RESOURCES, {
            filter: (i) => i.resourceType !== RESOURCE_ENERGY &&
            i.amount > (this.pos.getRangeTo(i) / this.moveEfficiency())
        });
        // Did we find resources?
        if (resources.length > 0) {
            this.log("Found some minerals picking the clostest");
            // get the closest resource
            resource = _.min(resources, (r) => thisCreep.pos.getRangeTo(r));
            // Did we find some resources?
            if (resource) {
                // We did, let's store their id
                this.memory.mineralPickup = resource.id;
            }
        }
    };

    Creep.prototype.moveEfficiency = function(): number {
        return 1;
    };
}
