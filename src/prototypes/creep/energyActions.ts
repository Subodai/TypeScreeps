import { Builder } from "roles/Builder";
import { Destroyer } from "roles/Destroyer";
import { Refiller } from "roles/Refiller";
import { RemoteEnergyHauler } from "roles/RemoteEnergyHauler";
import { Upgrader } from "roles/Upgrader";

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
    /* Are we near a link with memory of receiver limit to only upgraders,
    otherwise refillers become.. interesting*/
    if (!this.memory.energyPickup && this.memory.role === Upgrader.roleName) {
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
        const thisCreep: Creep = this;
        const id = this.findNearbyEnergyTarget();

        if (!this.memory.energyPickup) {
            if (this.memory.role === Builder.roleName || this.memory.level <= 2) {
                this.log("is a builder or room level is low");
                // Can this creep work?
                if (this.canWork() && this.memory.role !== Refiller.roleName) {
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
            target instanceof StructureTerminal ||
            target instanceof Tombstone
        ) { // Container, Storage, Terminal
            this.log("Target is Container, Storage, Terminal or Tombstone");
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
    this.log("No energy to collect");
    return ERR_NOT_FOUND;
};

Creep.prototype.fillContainers = function(): ScreepsReturnCode | false {
    this.log("Dumping to container");
    let target: StructureContainer;
    if (this.room.storage && _.sum(this.room.storage.store) >= this.room.storage.storeCapacity) {
        this.log("Room storage is full");
        target = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_CONTAINER && _.sum(s.store) < s.storeCapacity
        }) as StructureContainer;
        this.log(JSON.stringify(target));
        if (target) {
            this.log("Found a container");
            // Attempt transfer, unless out of range
            if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                // Let's go to the target
                this.travelTo(target);
                return ERR_NOT_IN_RANGE;
            } else {
                this.log("transfered to a container");
                // Succesful drop off
                return OK;
            }
        }
    }
    return false;
};

Creep.prototype.fillLabs = function(): ScreepsReturnCode | false {
    this.log("Attempting to fill a Lab");
    let target: StructureLab;
    target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_LAB &&
            (s.compoundIn === this.memory.mineralType || s.mineralIn === this.memory.mineralType)
            && s.mineralAmount < s.mineralCapacity
    }) as StructureLab;
    this.log(JSON.stringify(target));
    if (target) {
        this.log("found a lab");
        if (this.pos.getRangeTo(target) <= 1) {
            return this.transfer(target, this.memory.mineralType!);
        } else {
            this.travelTo(target);
            return ERR_NOT_IN_RANGE;
        }
    }
    return false;
};

Creep.prototype.fillLinks = function(): ScreepsReturnCode | false {
    return this.fillLinksAndLabs();
};

Creep.prototype.fillLinksAndLabs = function(): ScreepsReturnCode | false {
    this.log("Making sure links are filled");
    let target: StructureLink | StructureLab;
    if (this.room.storage) {
        this.log("Room has storage");
        target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_LINK &&
                s.linkType === "storage" &&
                s.energy < s.energyCapacity
        }) as StructureLink;
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
        target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_LAB &&
                s.energy < s.energyCapacity
        }) as StructureLab;
        this.log(JSON.stringify(target));
        if (target) {
            this.log("found a lab");
            // Attempt transfer, unless out of range
            if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                // Let's go to the target
                this.travelTo(target);
                return ERR_NOT_IN_RANGE;
            } else {
                this.log("transfered to a lab");
                // Succesful drop off
                return OK;
            }
        }
    }
    return false;
};

Creep.prototype.fillSpawns = function(): ScreepsReturnCode | false {
    let target: AnyStructure | null = null;
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
    return false;
};

Creep.prototype.fillTowers = function(): ScreepsReturnCode | false {
    let tower: StructureTower | null;
    // First find towers with less than 400 energy
    tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (i: AnyStructure) => i.structureType === STRUCTURE_TOWER && i.energy < 400
    }) as StructureTower;

    // If we didn't find any get them with less than 800
    if (!tower) {
        tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (i: AnyStructure) => i.structureType === STRUCTURE_TOWER && i.energy < 800
        }) as StructureTower;
    }

    // Okay all above 800, get any now
    if (!tower) {
        tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (i: AnyStructure) => i.structureType === STRUCTURE_TOWER && i.energy < i.energyCapacity
        }) as StructureTower;
    }

    // If towers are full, can we dump it into a lab?
    if (!tower) {
        tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (i: AnyStructure) => i.structureType === STRUCTURE_LAB && i.energy < i.energyCapacity
        }) as StructureTower;
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
    return false;
};

Creep.prototype.fillRoomStorageOrTerminal = function(): ScreepsReturnCode | false {
    this.log("attempting to fill storage or terminal");
    const target = this.pickStorageOrTerminal();
    if (target) {
        this.log("found storage or terminal");
        if (_.sum(target.store) >= target.storeCapacity) {
            this.log("storage or terminal full!");
            return false;
        }
        // reset idle
        this.memory.idle = 0;
        // Loop through our resources
        for (const res in this.carry) {
            this.log(res);
            this.log(JSON.stringify(target));
            // Attempt to transfer them
            if (this.carry.hasOwnProperty(res) && this.carry[res] > 0) {
                this.log("Attempting transfer");
                if (this.transfer(target, res as ResourceConstant) === ERR_NOT_IN_RANGE) {
                    this.log("Not in range");
                    this.travelTo(target);
                    return ERR_NOT_IN_RANGE;
                } else {
                    this.log("transferred to storage or terminal");
                    return OK;
                }
            }
        }
        this.log("Nothing in Carry");
    }
    // nope
    return false;
};

Creep.prototype.pickStorageOrTerminal = function(): StructureStorage |  StructureTerminal | null {
    // Okay time for some fancy maths
    const terminal = this.room.terminal;
    const storage = this.room.storage;
    let target: StructureStorage | StructureTerminal | null = null;
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
                    if (!target || _.sum(storage.store) === storage.storeCapacity) {
                        // try storage
                        target = terminal;
                    }
                } else {
                    target = terminal;
                    if (!target || _.sum(terminal.store) === terminal.storeCapacity) {
                        // try storage
                        target = storage;
                    }
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
        target = null;
    }
    return target;
};

/**
 * Fill Nuker with energy
 */
Creep.prototype.fillNukeEnergy = function(): ScreepsReturnCode | false {
    let nuker: StructureNuker | null = null;
    // Let's try to fill our nuker
    const nukers = this.room.find(FIND_MY_STRUCTURES, {
        filter: (i: AnyStructure) => i.structureType === STRUCTURE_NUKER && i.energy < i.energyCapacity
    }) as StructureNuker[];

    if (nukers.length > 0) {
        nuker = nukers[0];
    }
    // So did we find one?
    if (nuker) {
        this.log("found a nuker");
        // Attempt transfer, unless out of range
        if (this.transfer(nuker, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            // Let's go to the tower
            this.travelTo(nuker);
            return ERR_NOT_IN_RANGE;
        } else {
            this.log("transfered to a nuker");
            // Succesful drop off
            return OK;
        }
    }
    return false;
};

/**
 * Delivery Energy Wrapper
 */
Creep.prototype.deliverEnergy = function(): ScreepsReturnCode {
    let fillSpawns = false;
    if (this.role === Refiller.roleName || this.room.energyAvailable < this.room.energyCapacityAvailable * 0.85) {
        fillSpawns = true;
    }

    if (this.role === RemoteEnergyHauler.roleName || this.role === Destroyer.roleName) {
        fillSpawns = false;
    }

    // if we're a refiller prioritise links
    if (this.role === Refiller.roleName &&
        this.room.controller &&
        this.room.controller.level >= 5 &&
        this.carry.energy > 0) {
        const linkResult = this.fillLinks();
        if (linkResult !== false) {
            return linkResult;
        }
    }

    // only refill spawns and other things if room level below 4 after 4 we just fill storage
    // after 5 we fill storage and terminal
    // unless emergency, then we fill spawns too
    if (this.carry.energy > 0 && (
        fillSpawns || (this.room.controller && this.room.controller.level < 4) ||
        this.room.memory.emergency || !this.room.storage)
     ) {
        // Attempt to fill spawns
        const spawnsResult = this.fillSpawns();
        // If it worked, return the code
        if (spawnsResult !== false) {
            return spawnsResult;
        }
        // Now attempt to fill towers
        const towerResult = this.fillTowers();
        // If it worked, return the code
        if (towerResult !== false) {
            return towerResult;
        }
    }

    // if we have a nuke charge set, we need to fill nukers!
    if (this.room.memory.chargeNuke) {
        const nukeResult = this.fillNukeEnergy();
        if (nukeResult !== false) {
            return nukeResult;
        }
    }

    const labResult = this.fillLabs();
    if (labResult !== false) {
        return labResult;
    }

    // try and fill storage
    const storageResult = this.fillRoomStorageOrTerminal();
    // if it failed we need to go into idle
    if (storageResult === OK) {
        return storageResult;
    }
    if (storageResult !== false) {
        return storageResult;
    }

    const containerResult = this.fillContainers();

    if (containerResult === OK) {
        return containerResult;
    }
    if (containerResult !== false) {
        return containerResult;
    }

    // if we got to here we're probably idle
    if (!this.memory.idle) {
        this.memory.idle = 0;
    }
    this.memory.idle++;

    if (this.memory.idle && this.memory.idle >= 10) {
        // Are we in our home room?
        // if (creep.room.name != creep.memory.roomName) {
        // lets go home
        if (this.memory.roomName) {
            if (!Game.rooms[this.memory.roomName]) {
                const pos: RoomPosition = new RoomPosition(25, 25, this.memory.roomName);
                this.travelTo(pos);
                return ERR_NOT_FOUND;
            }
            const spawns = Game.rooms[this.memory.roomName].find(FIND_STRUCTURES, {
                filter: (i) => i.structureType === STRUCTURE_SPAWN
            });
            const spawn = spawns[0];
            if (spawn) {
                this.travelTo(spawn);
                return ERR_NOT_FOUND;
            }
        }
        // }
    }
    this.log("Got to end of deliver method with no return");
    return ERR_NOT_FOUND;
};

/**
 * Try and fine a nearby energy target
 */
Creep.prototype.findNearbyEnergyTarget = function(): void {
    let target = null;
    if (target === null) { target = this.findTombstoneEnergy(); }
    if (target === null) { target = this.findDroppedEnergy();   }
    if (target === null) { target = this.findContainerEnergy(); }
    if (target !== null) {
        this.memory.energyPickup = target.id;
    }
};

/**
 * Find Tombestone energy
 */
Creep.prototype.findTombstoneEnergy = function(): Tombstone | null {
    this.log("Checking for tombstones");
    // find Tombstones in the room
    const tombstones: Tombstone[] = this.room.find(FIND_TOMBSTONES, {
        filter: (t: Tombstone) => t.store.energy > 0
    });
    // If we found a tombstone with energy
    if (tombstones.length > 0) {
        // return the one with the most energy
        return _.max(tombstones, (t: Tombstone) => t.store.energy);
    }
    // nothing here, return null
    return null;
};

/**
 * Find dropped resource piles
 */
Creep.prototype.findDroppedEnergy = function(): Resource | null {
    this.log("Looking for dropped energy");
    const _creep: Creep = this;
    const resources: Resource[] = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: (i) => i.resourceType === RESOURCE_ENERGY &&
        i.amount > (this.carryCapacity - _.sum(this.carry)) / 4
    });
    // if we found some resources
    if (resources.length > 0) {
        // return the one that is most efficient
        return _.max(resources, (r) => r.amount / _creep.pos.getRangeTo(r));
    }
    return null;
};

/**
 * Find energy in containers
 */
Creep.prototype.findContainerEnergy = function(): Structure | null {
    this.log("Looking for energy containers");
    const _creep: Creep = this;
    const containers: Structure[] = this.room.find(FIND_STRUCTURES, {
        filter: (i) => i.structureType === STRUCTURE_CONTAINER &&
        i.store[RESOURCE_ENERGY] > (this.carryCapacity - _.sum(this.carry)) / 4
    });
    // did we find a suitable container
    if (containers.length > 0) {
        return _.max(containers, (c: StructureContainer) =>
            c.store[RESOURCE_ENERGY] / _creep.pos.getRangeTo(c));
    }
    return null;
};
