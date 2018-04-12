import { Debug } from "functions/debug";

/**
 * Load Structure Link Prototype Extensions
 */
export function loadStructureLinkPrototypes(): void {
    Debug.Load("Prototype: StructureLink");
    /**
     * LinkType Property
     */
    Object.defineProperty(StructureLink.prototype, "linkType", {
        configurable: true,
        enumerable: false,
        get(): any {
            if (!Memory.structures[this.id]) {
                Memory.structures[this.id] = {};
            }
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
}
