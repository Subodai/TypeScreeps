/**
 * Creep Actions related to minerals
 */

/**
 * Get Nearby minerals to pickup
 */
Creep.prototype.getNearbyMinerals = function(
    storage: boolean = false,
    type?: ResourceConstant): ScreepsReturnCode {
    // First are we full?
    if (this.full()) {
        this.log("Creep full cannot get nearby minerals");
        // Clear the pickup target
        this.invalidateMineralTarget(true);
        return ERR_FULL;
    }
    if (type) { this.findResourceOfType(type); }
    if (!this.memory.mineralPickup && storage) { this.findStorageMinerals(); }
    // Start with ground minerals
    if (!this.memory.mineralPickup) { this.findGroundMinerals(); }
    // Next Tombstone Minerals
    if (!this.memory.mineralPickup) { this.findTombstoneMinerals(); }
    // Next Container Minerals
    if (!this.memory.mineralPickup) { this.findContainerMinerals(); }
    // Next try reactor labs
    if (!this.memory.mineralPickup) { this.findLabMinerals(); }
    // Do we have a target?
    if (this.memory.mineralPickup) { return this.moveToAndPickupMinerals(); }
    // No target return not found
    return ERR_NOT_FOUND;
};

/**
 *
 */
Creep.prototype.findResourceOfType = function(type: ResourceConstant): void {
    this.log("looking for " + type);
    const targets = this.room.find(FIND_STRUCTURES, {
        filter: (s) =>
        (
            (
                s.structureType === STRUCTURE_TERMINAL ||
                s.structureType === STRUCTURE_STORAGE ||
                s.structureType === STRUCTURE_CONTAINER
            ) && s.store[type] !== undefined
        ) ||
        (
            s.structureType === STRUCTURE_LAB &&
            s.labType === "reactor" &&
            s.mineralType === type &&
            s.mineralAmount > 0
        )
    });
    if (targets.length > 0) {
        const target = _.first(targets);
        this.memory.mineralPickup = target.id;
        this.memory.mineralType = type;
        return;
    }
    // no joy, clear any previous values
    delete this.memory.mineralPickup;
    // delete this.memory.mineralType;
};

/**
 * Invalidate mineral storage in creep memory
 */
Creep.prototype.invalidateMineralTarget = function(full: boolean = false): ScreepsReturnCode {
    delete this.memory.mineralPickup;
    if (full) { return ERR_FULL; }
    return ERR_INVALID_TARGET;
};

/**
 * Finds reactors with minerals in
 */
Creep.prototype.findLabMinerals = function(): void {
    this.log("Creep searching for mineral labs");
    const labs = this.room.find(FIND_MY_STRUCTURES, {
        filter: (s) =>
            s.structureType === STRUCTURE_LAB &&
            (
                (s.labType === "reactor" && s.mineralAmount > s.mineralCapacity / 10) ||
                (s.emptyMe === true && s.mineralAmount > 0) // TODO: Can empty me be set by the lab itself?
            )
    }) as StructureLab[];
    if (labs.length > 0) {
        const target: StructureLab = _.max(labs, (l) => l.mineralAmount);
        this.memory.mineralPickup = target.id;
    }
};

/**
 * Find minerals in storage
 */
Creep.prototype.findStorageMinerals = function(): void {
    // Have an override, call it storeMinerals for now (it'l do)
    if (this.room.memory.storeMinerals) { return; }
    if (!this.room.terminal) { return; }
    const storage = this.room.storage;
    const terminal = this.room.terminal;
    // Does this room have a storage? (no harm in checking)
    if (storage) {
        // Is there something other than energy in the storage? (and space in the terminal)
        if (_.sum(storage.store) - storage.store[RESOURCE_ENERGY] > 0 &&
            _.sum(terminal.store) < terminal.storeCapacity) {
            // Set the target to be the storage
            this.memory.mineralPickup = storage.id;
        }
    }
};

/**
 * Find ground based minerals
 */
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
        this.log("Found some minerals picking the closest");
        // get the closest resource
        resource = _.min(resources, (r) => thisCreep.pos.getRangeTo(r));
        // Did we find some resources?
        if (resource) {
            // We did, let's store their id
            this.memory.mineralPickup = resource.id;
        }
    }
};

/**
 * Find minerals in tombstones
 */
Creep.prototype.findTombstoneMinerals = function(): void {
    let tombstone: boolean | Tombstone = false;
    const thisCreep = this;
    this.log("Creep searching for mineral tombstones");
    // get tombstones
    const tombstones: Tombstone[] = this.room.find(FIND_TOMBSTONES, {
        filter: (t: Tombstone) => (_.sum(t.store) - t.store[RESOURCE_ENERGY]) > 0
    });
    if (tombstones.length > 0) {
        this.log("Found some mineral tombstones");
        tombstone = _.max(tombstones, (t: Tombstone) =>
            (_.sum(t.store) - t.store[RESOURCE_ENERGY]) / thisCreep.pos.getRangeTo(t));
        if (tombstone) {
            this.memory.mineralPickup = tombstone.id;
        }
    }
};

/**
 * Find minerals on containers
 */
Creep.prototype.findContainerMinerals = function(): void {
    let container: boolean | Structure = false;
    const thisCreep = this;
    this.log("Creep searching for mineral containers");
    // Check for containers with anything other than energy in them
    const containers = this.room.find(FIND_STRUCTURES, {
        filter: (i) => i.structureType === STRUCTURE_CONTAINER &&
            (_.sum(i.store) - i.store[RESOURCE_ENERGY]) > 0
    });
    // Any containers?
    if (containers.length > 0) {
        this.log("Found some mineral containers, picking the most cost effective");
        container = _.max(containers, (c: StructureContainer) =>
            (_.sum(c.store) - c.store[RESOURCE_ENERGY]) / thisCreep.pos.getRangeTo(c));
        // Did we find a container
        if (container) {
            // We did it, store the id
            this.memory.mineralPickup = container.id;
        }
    }
};

/**
 * Move to and pickup minerals
 */
Creep.prototype.moveToAndPickupMinerals = function(): ScreepsReturnCode {
    this.log("Found minerals in memory " + this.memory.mineralPickup);
    const target: Resource | StructureContainer | StructureStorage | Tombstone | StructureLab | null =
        Game.getObjectById(this.memory.mineralPickup);
    // if the target is invalid, or cannot be found let's clear it
    if (!target) { return this.invalidateMineralTarget(); }

    // Quick validation pass on the target
    if (target instanceof Resource) {
        // If it's going to dispawn before we get there, then there's no point in carrying on
        if (target.amount < (this.pos.getRangeTo(target) / this.moveEfficiency())) {
            return this.invalidateMineralTarget();
        }
        // Can we pick it up yet?
        if (!this.canPickup(target)) {
            this.say(global.sayMove);
            // We can't pick it up yet, let's move to it
            this.travelTo(target);
        }
        // Can we pick it up after our move?
        if (this.canPickup(target)) {
            // Attempt to pick it up
            const pickupResult = this.pickup(target);
            // Check the result
            if (pickupResult === ERR_NOT_IN_RANGE) {
                // something went wrong
            } else if (pickupResult === OK) {
                this.say(global.sayPickup);
                // Invalidate and return full
                return this.invalidateMineralTarget(true);
            }
        }
    } else if (target instanceof StructureContainer ||
                target instanceof StructureStorage ||
                target instanceof StructureTerminal ||
                target instanceof Tombstone
    ) {
        this.log("Target is Container, Storage, Terminal or Tombstone");
        // Check there is still res in the container
        if (_.sum(target.store) - target.store[RESOURCE_ENERGY] === 0) {
            return this.invalidateMineralTarget();
        }
        // Can we pick it up yet?
        if (!this.canPickup(target)) {
            // Can't pick it up yet, so lets move towards it
            this.travelTo(target);
        }
        // Can we pick it up now?
        if (this.canPickup(target)) {
            if (this.memory.mineralType) {
                const r = this.memory.mineralType;
                // If there is more than 0 of this mineral, let's pick it up
                if (target.store.hasOwnProperty(r) && r !== RESOURCE_ENERGY) {
                    // Attempt to pick it up
                    const pickupResult = this.withdraw(target, r as ResourceConstant);
                    // check the result
                    if (pickupResult === ERR_NOT_IN_RANGE) {
                        // something probbaly went wrong
                    } else if (pickupResult === OK) {
                        this.say(global.sayWithdraw);
                        // Invalidate and return full
                        return this.invalidateMineralTarget(this.full());
                    }
                }
            } else {
                // Loop through all the resources in the container
                for (const r in target.store) {
                    // If there is more than 0 of this mineral, let's pick it up
                    if (target.store.hasOwnProperty(r) && r !== RESOURCE_ENERGY) {
                        // Attempt to pick it up
                        const pickupResult = this.withdraw(target, r as ResourceConstant);
                        // check the result
                        if (pickupResult === ERR_NOT_IN_RANGE) {
                            // something probbaly went wrong
                        } else if (pickupResult === OK) {
                            this.say(global.sayWithdraw);
                            // Invalidate and return full
                            return this.invalidateMineralTarget(this.full());
                        }
                    }
                }
            }
        }
    } else if (target instanceof StructureLab) {
        this.log("Target is a Lab");
        if (target.mineralAmount === 0) {
            return this.invalidateMineralTarget();
        }
        // Can we pick it up yet?
        if (!this.canPickup(target)) {
            // Can't pick it up yet, so lets move towards it
            this.travelTo(target);
        }
        // Can we pick it up now?
        if (this.canPickup(target)) {
            // Attempt to pick it up
            const pickupResult = this.withdraw(target, target.mineralType as ResourceConstant);
            // check the result
            if (pickupResult === ERR_NOT_IN_RANGE) {
                // something probbaly went wrong
            } else if (pickupResult === OK) {
                this.say(global.sayWithdraw);
                // Invalidate and return full
                return this.invalidateMineralTarget(this.full());
            }
        }
    }
    // We've probably moved return ok
    return OK;
};

/**
 * Fill Nuker with Ghodium
 */
Creep.prototype.fillNukeGhodium = function(): ScreepsReturnCode | false {
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
        if (this.transfer(nuker, RESOURCE_GHODIUM) === ERR_NOT_IN_RANGE) {
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

// Creep.prototype.deliverMinerals = function(): ScreepsReturnCode {
//     // if (this.fillRoomStorageOrTerminal() !== false) {
//     //     return OK;
//     // }
//     return OK;
// };
Creep.prototype.fillLabs = function(): ScreepsReturnCode | false {
    this.log("Attempting to fill a Lab");
    let target: StructureLab | StructureTerminal | StructureStorage | null;
    target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_LAB &&
            (s.compoundIn === this.memory.mineralType || s.mineralIn === this.memory.mineralType)
            && s.mineralAmount < s.mineralCapacity
            && s.emptyMe === false
    }) as StructureLab;
    this.log(JSON.stringify(target));
    if (!target) {
        // tslint:disable-next-line:max-line-length
        target = this.room.terminal && _.sum(this.room.terminal.store) < this.room.terminal.storeCapacity ? this.room.terminal : null;
        if (!target) {
            // tslint:disable-next-line:max-line-length
            target = this.room.storage && _.sum(this.room.storage.store) < this.room.storage.storeCapacity ? this.room.storage : null;
        }
        this.log("dumping to storage");
    }
    if (target) {
        this.log("found a target");
        if (this.pos.getRangeTo(target) <= 1) {
            if (target instanceof StructureTerminal ||
                target instanceof StructureStorage) {
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
                }
            return this.transfer(target, this.memory.mineralType!);
        } else {
            this.travelTo(target);
            return ERR_NOT_IN_RANGE;
        }
    }
    return false;
};
