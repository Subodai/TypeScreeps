/**
 * Basic Creep Actions
 */

/**
 * Is Creep Tired
 * @returns {boolean}
 */
Creep.prototype.isTired = function(): boolean {
    return this.spawning || this.fatigue > 0;
};

/**
 * Is Creep on hold?
 */
Creep.prototype.isOnHold = function(): boolean {
    if (this.memory.sleepUntil) {
        if (this.memory.sleepUntil > Game.time) {
            return true;
        }
        delete this.memory.sleepUntil;
    }
    return false;
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

Creep.prototype.moveEfficiency = () => {
    return 1;
};

/**
 * Is creep in it's home room?
 * @param creep {Creep}
 */
Creep.prototype.atHome = function(): boolean {
    if (this.room.name !== this.memory.roomName) {
        delete this.memory.energyPickup;
        if (this.memory.roomName) {
            const pos = new RoomPosition(25, 25, this.memory.roomName);
            this.travelTo(pos, { ensurePath: true });
            return false;
        }
    }
    return true;
};

/**
 * Clear creep memory
 * @returns {void}
 */
Creep.prototype.clearTargets = function(): void {
    const mem: CreepMemory = {
        boosted: this.memory.boosted,
        level: this.memory.level,
        role: this.memory.role,
        roomName: this.memory.roomName,
        sType: this.memory.sType, // todo remove?
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
                this.travelTo(pos, {
                    ensurePath: true
                });
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
 * Is creep near end of life?
 * @returns {void}
 */
Creep.prototype.deathCheck = function(ticks: number): void {
    if (!this.memory.dying && this.ticksToLive && this.ticksToLive < ticks) {
        this.memory.dying = true;
    }
};

/**
 * Go to nearest spawn and despawn
 */
Creep.prototype.deSpawn = function(): void {
    this.log("Despawning Creep");
    let spawn = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (i) => i.structureType === STRUCTURE_SPAWN && i.my
    });
    if (!spawn) {
        const spawns = Game.rooms[this.memory.roomName!].find(FIND_STRUCTURES, {
            filter: (i) => i.structureType === STRUCTURE_SPAWN && i.my
        });
        spawn = spawns[0];
    }
    // if we found a spawn and it's a.. spawn
    if (spawn && spawn instanceof StructureSpawn) {
        // if we're more than 1 away
        if (this.pos.getRangeTo(spawn.pos) > 1) {
            this.log("Moving to spawn");
            // move to it
            this.travelTo(spawn);
            return;
        }
        // otherwise, recycle self using the spawn
        spawn.recycleCreep(this);
    }
};

Creep.prototype.goToRoom = function(roomName: string): void {
    this.log("Attempting to go to 25, 25, " + roomName);
    const pos = new RoomPosition(25, 25, roomName);
    this.travelTo(pos, {
        ensurePath: true
    });
};
