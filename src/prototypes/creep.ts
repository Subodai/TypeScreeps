import * as STATE from "config/states";
import { Debug } from "functions/debug";
import { Traveler } from "utils/Traveler";

/**
 * Creep Prototype Extension
 */
export function loadCreepPrototypes(): void {
    // Some debug
    Debug.Load("Prototype: Creep");

    // tslint:disable-next-line:max-line-length
    // Creep.prototype.travelTo = function(destination: RoomPosition | { pos: RoomPosition }, options?: TravelToOptions) {
    //     return Traveler.travelTo(this, destination, options);
    // };

    /**
     * The role of the creep
     */
    Object.defineProperty(Creep.prototype, "role", {
        configurable: true,
        enumerable: true,
        get(): string {
            if (!Memory.creeps[this.name].role) {
                Memory.creeps[this.name].role = "Unknown";
            }
            return Memory.creeps[this.name].role;
        },
        set(v: string): string {
            return _.set(Memory, "creeps." + this.name + ".role", v);
        }
    });

    /**
     * The current State of the creep
     */
    Object.defineProperty(Creep.prototype, "state", {
        configurable: true,
        enumerable: true,
        get(): CreepState {
            if (!Memory.creeps[this.name].state) {
                Memory.creeps[this.name].state = STATE._SPAWN;
            }
            return Memory.creeps[this.name].state;
        },
        set(v: CreepState): CreepState {
            return _.set(Memory, "creeps." + this.name + ".state", v);
        }
    });

    /**
     * Log Handler to make it tidier
     */
    Creep.prototype.log = function(msg: string): void {
        Debug.creep(msg, this);
    };

    /**
     * Is Creep Tired
     * @returns {boolean}
     */
    Creep.prototype.isTired = function(): boolean {
        return this.spawning || this.fatigue > 0;
    };

    /**
     * Clear creep memory
     * @returns {void}
     */
    Creep.prototype.clearTargets = function(): void {
        const mem: CreepMemory = {
            level: this.memory.level,
            role: this.memory.role,
            roomName: this.memory.roomName,
            sType: this.memory.sType,
            state: this.memory.state
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

    /**
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
                    // this.travelTo(pos);
                    this.moveTo(pos);
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
                // this.travelTo(target);
                this.moveTo(target);
                return OK;
            }
        }
        return ERR_BUSY;
    };

    Creep.prototype.deliverEnergy = function(): ScreepsReturnCode {
        let fillSpawns = false;
        if (this.room.energyAvailable < this.room.energyCapacityAvailable * 0.75) {
            fillSpawns = true;
        }
        let target: any;
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
                        ) && s.energy < s.energyCapacity;
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
                            // this.travelTo(target);
                            this.moveTo(target);
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
                        // this.travelTo(tower);
                        this.moveTo(tower);
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
                        // this.travelTo(target);
                        this.moveTo(target);
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
            this.memory.idle ++;

            if (this.memory.idle && this.memory.idle >= 10) {
                // Are we in our home room?
                // if (creep.room.name != creep.memory.roomName) {
                // lets go home
                const spawns = Game.rooms[this.memory.roomName!].find(FIND_STRUCTURES, {
                    filter: (i) => i.structureType === STRUCTURE_SPAWN
                });
                const spawn = spawns[0];
                if (spawn) {
                    // this.travelTo(spawn);
                    this.moveTo(spawn);
                    return ERR_NOT_FOUND;
                }
                // }
            }
        }
        this.log("Got to end of deliver method with no return");
        return ERR_NOT_FOUND;
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

    /**
     * Invalidate mineral storage in creep memory
     */
    Creep.prototype.invalidateMineralTarget = function(full: boolean = false): number {
        delete this.memory.mineralPickup;
        if (full) { return ERR_FULL; }
        return ERR_INVALID_TARGET;
    };

    /**
     * Find minerals in storage
     */
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
    Creep.prototype.moveToAndPickupMinerals = function(): number {
        this.log("Found minerals in memory");
        const target: Resource | StructureContainer | StructureStorage | null =
        Game.getObjectById(this.memory.mineralPickup);
        // if the target is invalid, or cannot be found let's clear it
        if (!target) { return this.invalidateMineralTarget(); }
        // Quick validation pass on the target
        if (target instanceof Resource) {
            // If it's going to disapwn before we get there, then there's no point in carrying on
            if (target.amount < (this.pos.getRangeTo(target) / this.moveEfficiency())) {
                return this.invalidateMineralTarget();
            }
            // Can we pick it up yet?
            if (!this.canPickup(target)) {
                this.say(global.sayMove);
                // We can't pick it up yet, let's move to it
                // this.travelTo(target);
                this.moveTo(target);
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
        } else if (target instanceof StructureContainer || target instanceof StructureStorage) {
            // Check there is still res in the container
            if (_.sum(target.store) - target.store[RESOURCE_ENERGY] === 0) {
                return this.invalidateMineralTarget();
            }
            // Can we pick it up yet?
            if (!this.canPickup(target)) {
                this.say(global.sayMove);
                // Can't pick it up yet, so lets move towards it
                // this.travelTo(target);
                this.moveTo(target);
            }
            // Can we pick it up now?
            if (this.canPickup(target)) {
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
        // We've probably moved return ok
        return OK;
    };

    /**
     * Is creep in range of target to pick it up?
     */
    Creep.prototype.canPickup = function(target: RoomObject, range: number = 1): boolean {
        if (!target) { return false; }
        // Are we within 1 range?
        return this.pos.inRangeTo(target, range);
    };

    /**
     * Is Creep Full?
     */
    Creep.prototype.full = function() {
        return _.sum(this.carry) >= this.carryCapacity;
    };

    /**
     * Is Creep empty?
     */
    Creep.prototype.empty = function() {
        return _.sum(this.carry) === 0;
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
                    // this.travelTo(target);
                    this.moveTo(target);
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
                    // this.travelTo(spawn);
                    this.moveTo(spawn);
                }
            }
            return ERR_INVALID_TARGET;
        }
        return OK;
    };
}
