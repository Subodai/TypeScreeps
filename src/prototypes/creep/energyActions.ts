import { Refiller } from "roles/Refiller";

/**
 * Find and collect nearby energy
 *
 * @param useStorage bool
 * @param emergency bool
 */
Creep.prototype.getNearbyEnergy = function(
    useStorage: boolean = false,
    emergency: boolean = false): ScreepsReturnCode {
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

Creep.prototype.deliverEnergy = function(): ScreepsReturnCode {
    let fillSpawns = false;
    if (this.role === Refiller.roleName || this.room.energyAvailable < this.room.energyCapacityAvailable * 0.85) {
        fillSpawns = true;
    }
    let target: any;

    // if we're a refiller prioritise links
    if (this.role === Refiller.roleName && this.room.controller && this.room.controller.level >= 5) {
        this.log("Making sure links are filled");
        if (this.room.storage) {
            this.log("Room has storage");
            target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_LINK &&
                s.linkType === "storage" &&
                s.energy < s.energyCapacity
            });
            this.log(JSON.stringify(target));
            if (target) {
                this.log("found a link");
                // Attempt transfer, unless out of range
                if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    // Let's go to the target
                    this.travelTo(target);
                    return ERR_NOT_IN_RANGE;
                } else {
                    this.log("transfered to a link");
                    // Succesful drop off
                    return OK;
                }
            }
        }
    }

    // only refill spawns and other things if room level below 4 after 4 we just fill storage
    // after 5 we fill storage and terminal
    // unless emergency, then we fill spawns too
    if (fillSpawns || this.room.controller!.level < 4 || this.room.memory.emergency || !this.room.storage) {
        // Do we have energy?
        if (this.carry.energy > 0) {
            // We do, try to find a spawn or extension to fill
            target = this.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s: AnyStructure) => {
                    return (
                        s.structureType === STRUCTURE_EXTENSION ||
                        s.structureType === STRUCTURE_SPAWN
                    ) && s.isActive && s.energy < s.energyCapacity;
                }
            });
        }
        // Did we find a spawn or extension?
        if (target) {
            this.log("found spawn or extension");
            // Yep, so reset idle
            this.memory.idle = 0;
            // Loop through our carry
            for (const res in this.carry) {
                // Only try to delivery energy to spawn and exention
                if (res === RESOURCE_ENERGY) {
                    const result = this.transfer(target, res);
                    // If we're not in range
                    if (result === ERR_NOT_IN_RANGE) {
                        // Move to it
                        this.travelTo(target);
                        return ERR_NOT_IN_RANGE;
                    } else if (result === OK) {
                        this.log("transfered energy to spawn or extension");
                        return OK;
                    } else {
                        this.log(JSON.stringify(result));
                        return result;
                    }
                }
            }
        }
        // We didn't find a target yet, do we still have energy to use?
        if (this.carry.energy > 0) {
            let tower: any;
            // First find towers with less than 400 energy
            tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (i: AnyStructure) => i.structureType === STRUCTURE_TOWER && i.energy < 400
            });

            // If we didn't find any get them with less than 800
            if (!tower) {
                tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (i: AnyStructure) => i.structureType === STRUCTURE_TOWER && i.energy < 800
                });
            }

            // Okay all above 800, get any now
            if (!tower) {
                tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (i: AnyStructure) => i.structureType === STRUCTURE_TOWER && i.energy < i.energyCapacity
                });
            }

            // If towers are full, can we dump it into a lab?
            if (!tower) {
                tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (i: AnyStructure) => i.structureType === STRUCTURE_LAB && i.energy < i.energyCapacity
                });
            }
            // So did we find one?
            if (tower) {
                this.log("found a tower");
                // Attempt transfer, unless out of range
                if (this.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    // Let's go to the tower
                    this.travelTo(tower);
                    return ERR_NOT_IN_RANGE;
                } else {
                    this.log("transfered to a tower");
                    // Succesful drop off
                    return OK;
                }
            }
        }
    }
    // Okay time for some fancy maths
    const terminal = this.room.terminal;
    const storage = this.room.storage;

    // If we have both storage and terminal
    if (storage && terminal) {
        if (this.room.memory.prioritise) {
            if (this.room.memory.prioritise === "terminal") {
                if (_.sum(terminal.store) < terminal.storeCapacity) {
                    target = terminal;
                } else {
                    target = storage;
                }
            } else if (this.room.memory.prioritise === "storage") {
                if (_.sum(storage.store) < storage.storeCapacity) {
                    target = storage;
                } else {
                    target = terminal;
                }
            } else {
                if (this.carry.energy > 0) {
                    target = storage;
                } else {
                    target = terminal;
                }
            }
        } else {
            // Do we have energy?
            if (this.carry.energy > 0) {
                // Lets just assume these exist and get the percentage filled
                // We need to know the relative filled of each of these, \
                // so [filled / (capacity/100)] should give us the percentage?
                const terminalP = (_.sum(terminal.store) / (terminal.storeCapacity / 100));
                const storageP = (_.sum(storage.store) / (storage.storeCapacity / 100));
                // If the fill percentage is less or equal
                if (terminalP <= storageP) {
                    target = terminal;
                }
                // if it's the other way around use storage
                if (storageP < terminalP) {
                    target = storage;
                }
            } else {
                // Prioritise the terminal for non-energy
                target = terminal;
                // If we don't have one
                if (!target || _.sum(terminal.store) === terminal.storeCapacity) {
                    // try storage
                    target = storage;
                }
            }
        }

    } else if (storage) { // Room storage?
        target = storage;
    } else {
        // We've no targets... now what?
    }
    // Did we find a target?
    if (target) {
        this.log("found storage or terminal");
        // reset idle
        this.memory.idle = 0;
        // Loop through our resources
        for (const res in this.carry) {
            // Attempt to transfer them
            if (this.carry.hasOwnProperty(res)) {
                if (this.transfer(target, res as ResourceConstant) === ERR_NOT_IN_RANGE) {
                    this.travelTo(target);
                    return ERR_NOT_IN_RANGE;
                } else {
                    this.log("transferred to storage or terminal");
                    return OK;
                }
            }
        }
    } else {
        if (!this.memory.idle) {
            this.memory.idle = 0;
        }
        this.memory.idle++;

        if (this.memory.idle && this.memory.idle >= 10) {
            // Are we in our home room?
            // if (creep.room.name != creep.memory.roomName) {
            // lets go home
            const spawns = Game.rooms[this.memory.roomName!].find(FIND_STRUCTURES, {
                filter: (i) => i.structureType === STRUCTURE_SPAWN
            });
            const spawn = spawns[0];
            if (spawn) {
                this.travelTo(spawn);
                return ERR_NOT_FOUND;
            }
            // }
        }
    }
    this.log("Got to end of deliver method with no return");
    return ERR_NOT_FOUND;
};
