import { Debug } from "functions/debug";

export function loadRoomPrototypes(): void {
    Debug.Load("Prototype: Room");

    Room.prototype.log = function(msg: string): void {
        Debug.Room(msg, this);
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
            filter: (i: Creep) => !(global.friends.indexOf(i.owner.username) > -1)
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
}
