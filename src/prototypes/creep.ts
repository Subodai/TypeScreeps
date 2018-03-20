import { Debug } from "functions/debug";
import { Traveler } from "utils/Traveler";

/**
 * Creep Prototype Extension
 */
export function loadCreepPrototypes(): void {
    // Some debug
    Debug.Log("Loading Creep Prototype");
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
        Debug.creep("Target Reset", this);
    };

    Creep.prototype.canWork = function() {
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

    /**
     * Find and collect nearby energy
     *
     * @param useStorage bool
     * @param emergency bool
     */
    Creep.prototype.getNearbyEnergy = function(useStorage: boolean = false, emergency: boolean = false): number {
        // First, are we full?
        if (_.sum(this.carry) === this.carryCapacity) {
            Debug.creep("Creep Full Cannot Get Nearby Energy", this);
            // Clear our pickup target
            delete this.memory.energyPickup;
            return ERR_FULL;
        }
        /* Are we near a link with memory of receiver limit to only upgraders or supergraders,
        otherwise refillers become.. interesting*/
        if (!this.memory.energyPickup && (this.memory.role === "upgrader" || this.memory.role === "supergrader")) {
            Debug.creep("Checking for links", this);
            // If we're in our own room, with our own controller, above level 5 (should have links)
            if (this.room.controller && this.room.controller.my && this.room.controller.level >= 5) {
                Debug.creep("Links available", this);
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
            Debug.creep("Creep has no memory, finding stuff to pickup", this);
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
                Debug.creep("Found " + resources.length + " resource piles", this);
                resource = _.max(resources, (r) => r.amount / thisCreep.pos.getRangeTo(r));
            }
            // if we have containers
            if (containers.length > 0) {
                Debug.creep(" Found " + containers.length + " containers", this);
                container = _.max(containers, (c: StructureContainer) =>
                            c.store[RESOURCE_ENERGY] / thisCreep.pos.getRangeTo(c));
            }
            // If we have both we need to pick the closest one
            if (resource && container) {
                // If the resource is closer
                if (this.pos.getRangeTo(resource) < this.pos.getRangeTo(container)) {
                    Debug.creep("Stored resource pile " + resource.id + " in memory", this);
                    this.memory.energyPickup = resource.id;
                } else {
                    Debug.creep("Stored container " + container.id + " in memory", this);
                    this.memory.energyPickup = container.id;
                }
            } else if (resource) {
                Debug.creep("Stored resource pile " + resource.id + " in memory", this);
                this.memory.energyPickup = resource.id;
            } else if (container) {
                Debug.creep("Stored container " + container.id + " in memory", this);
                this.memory.energyPickup = container.id;
            }
            if (this.memory.role === "builder" || this.memory.level <= 2) {
                // Nothing found? lets try finding available sources
                if (!this.memory.energyPickup) {
                    // Can this creep work?
                    if (this.canWork() && this.memory.role != 'refiller') {
                        DBG && console.log('[' + this.name + '] Can work finding sources');
                        const source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
                            filter: function (i) {
                                if (i.energy > 0 || i.ticksToRegeneration < 10) {
                                    const space = thisCreep.findSpaceAtSource(i);
                                    return space;
                                } else {
                                    return false;
                                }
                            }
                        });
                        if (source) {
                            DBG && console.log('[' + this.name + '] Stored Source ' + container.id + ' in creep memory');
                            this.memory.energyPickup = source.id;
                        }
                    }
                }
            }
        }
        // Do we have a target?
        if (this.memory.energyPickup) {
            DBG && console.log('[' + this.name + '] Found Energy source in creeps memory ' + this.memory.energyPickup);
            // We do! let's grab it
            const target = Game.getObjectById(this.memory.energyPickup);
            if (!target) {
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            var pickupSuccess = true;
            // Alright what is it?
            if (target instanceof Resource) { // Resource
                DBG && console.log('[' + this.name + '] Target is a Resource');
                // Is there still enough of it?
                if (target.amount <= 0 /* (this.carryCapacity - _.sum(this.carry))/4*/) {
                    DBG && console.log('[' + this.name + '] Resource no longer viable clearing memory');
                    // Target has gone, clear memory
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Only bother trying to pick up if we're within 1 range
                if (this.pos.inRangeTo(target, 1)) {
                    DBG && console.log('[' + this.name + '] Target should be in range, attempting pickup');
                    // First attempt to pickitup
                    if (this.pickup(target) === ERR_NOT_IN_RANGE) {
                        DBG && console.log('[' + this.name + '] Pickup failed');
                        var pickupSuccess = false;
                    }
                } else {
                    DBG && console.log('[' + this.name + '] Target not in range');
                    var pickupSuccess = false;
                }
            } else if (target instanceof StructureContainer || target instanceof StructureStorage || target instanceof StructureTerminal) { // Container, Storage, Terminal
                DBG && console.log('[' + this.name + '] Target is a Container, Storage, or Terminal');
                // Check the container still has the energy
                if (target.store[RESOURCE_ENERGY] <= 0 /* (this.carryCapacity - _.sum(this.carry))/4*/) {
                    DBG && console.log('[' + this.name + '] Target no longer has enough energy clearing memory');
                    // Clear memory and return invalid target
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Only bother trying to pick up if we're within 1 range
                if (this.pos.inRangeTo(target, 1)) {
                    DBG && console.log('[' + this.name + '] Target should be in range, attempting withdraw');
                    // Lets attempt to withdraw
                    if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        DBG && console.log('[' + this.name + '] Withdraw failed');
                        var pickupSuccess = false;
                    }
                } else {
                    DBG && console.log('[' + this.name + '] Target not in range');
                    var pickupSuccess = false;
                }
            } else if (target instanceof StructureLink) { // Link
                DBG && console.log('[' + this.name + '] Target is a Link');
                // Check the container still has the energy
                if (target.energy == 0) {
                    DBG && console.log('[' + this.name + '] Target no longer has enough energy clearing memory');
                    // Clear memory and return invalid target
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Only bother trying to pick up if we're within 1 range
                if (this.pos.inRangeTo(target, 1)) {
                    DBG && console.log('[' + this.name + '] Target should be in range, attempting withdraw');
                    // Lets attempt to withdraw
                    if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        DBG && console.log('[' + this.name + '] Withdraw failed');
                        var pickupSuccess = false;
                    }
                } else {
                    DBG && console.log('[' + this.name + '] Target not in range');
                    var pickupSuccess = false;
                }

            } else if (target instanceof Source) { // Source
                if (this.memory.role != 'builder' && this.memory.level >= 2) {
                    delete this.memory.energyPickup;
                }
                if (!this.canWork()) {
                    // no clear the memory
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Does it still have energy ?
                if (target.energy == 0) {
                    DBG && console.log('[' + this.name + '] Source no longer has energy, clearing memory');
                    // no clear the memory
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Check for space
                if (!this.findSpaceAtSource(target)) {
                    DBG && console.log('[' + this.name + '] Source no longer has space, clearing memory');
                    // no clear the memory
                    delete this.memory.energyPickup;
                    return ERR_INVALID_TARGET;
                }
                // Only bother trying to pick up if we're within 1 range
                if (this.pos.inRangeTo(target, 1)) {
                    DBG && console.log('[' + this.name + '] Target should be in range, attempting harvest');
                    // Alright lets try harvesting it
                    if (this.harvest(target) === ERR_NOT_IN_RANGE) {
                        DBG && console.log('[' + this.name + '] Harvest failed');
                        var pickupSuccess = false;
                    }
                } else {
                    DBG && console.log('[' + this.name + '] Target not in range');
                    var pickupSuccess = false;
                }
            } else {
                // Something went wrong, or what we wanted to pickup has disapeared...
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Did we successfully pick up the thing
            if (pickupSuccess) {
                DBG && console.log('[' + this.name + '] Successfully gathered resources');
                this.say(global.sayWithdraw);
                // Are we now full?
                if (this.carry.energy === this.carryCapacity) {
                    DBG && console.log('[' + this.name + '] Creep is now full clearing pickup memory');
                    // Alright we're full clear memory and return full
                    delete this.memory.energyPickup;
                    return ERR_FULL;
                }
                // Just return OK, we're not full yet
                return OK;
            } else {
                DBG && console.log('[' + this.name + '] Moving closer to target');
                // We probably need to move
                this.travelTo(target);
                // Say!
                this.say(global.sayMove);
                return OK;
            }
        }

    };
}
