import { Debug } from "functions/debug";

/**
 * Load Structure Link Prototype Extensions
 */
Debug.Log("Prototype: StructureLink");

StructureLink.prototype.log = function(msg: string): void {
    Debug.Link(msg, this);
};

// tslint:disable-next-line:only-arrow-functions
StructureLink.prototype.countCPU = function(start: number): number {
    return Game.cpu.getUsed() - start;
};

/**
 * LinkType Property
 */
Object.defineProperty(StructureLink.prototype, "linkType", {
    configurable: true,
    enumerable: false,
    get(): any {
        this.initMemory();
        if (!Memory.structures[this.id].linkType) {
            let type: string = "receiver";
            // if we're within 2 of the storage
            if (this.room.storage && this.pos.inRangeTo(this.room.storage, 2)) {
                type = "storage";
            }
            // Initialise this link
            Memory.structures[this.id].linkType = type;
        }
        return Memory.structures[this.id].linkType;
    },
    set(v: any): any {
        return _.set(Memory, "structures." + this.id + ".linkType", v);
    }
});

StructureLink.prototype.runReceiver = function(): number {
    // get starting CPU
    const start = Game.cpu.getUsed();
    // Get the storage links in the room
    const storageLinks = this.room.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_LINK &&
                       s.linkType === "storage" &&
                       s.energy >= (s.energyCapacity * 0.5) &&
                       s.cooldown === 0
    });
    // Did we find one?
    if (storageLinks.length > 0) {
        this.log("Found storage link");
        // grab the link
        const from = storageLinks[0] as StructureLink;
        // transfer
        from.transferEnergy(this);
    }
    return this.countCPU(start);
};
