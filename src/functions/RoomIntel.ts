class RoomIntel {

    private INTEL_UPDATED: string = "u";
    private INTEL_LEVEL: string = "l";
    private INTEL_PRACTICAL_LEVEL: string = "r";
    private INTEL_OWNER: string = "o";
    private INTEL_MINERAL: string = "m";
    private INTEL_SOURCES: string = "s";
    private INTEL_RESOURCE_POSITIONS: string = "p";
    private INTEL_WALKABILITY: string = "w";
    private INTEL_SWAMPINESS: string = "a";
    private INTEL_BLOCKED_EXITS: string = "b";

    public saveIntel(roomname: string, refresh: boolean = false): {[k: string]: any} {
        if (!Memory.intel) {
            Memory.intel = {
                buffer: {},
                targets: {},
                // tslint:disable-next-line:object-literal-sort-keys
                active: {}
            };
        }

        let info: {[key: string]: any};
        if (refresh) {
            info = {};
        } else {
            info = this.getIntel(roomname, {skipRequest: true});
            if (!info) {
                info = {};
            }
        }

        info[this.INTEL_UPDATED] = Game.time - _.random(0, 10);

        return info;
    }

    public getIntel(roomname: string, opts = {}) {
        if (Memory.intel && Memory.intel.buffer[roomname]) {
            return Memory.intel.buffer[roomname];
        }
    }
}
