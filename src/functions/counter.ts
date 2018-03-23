export class Counter {

    private static notify: boolean = false;

    /**
     * Run the main counter
     */
    public static run(): void {
        // Loop through all rooms
        for (const room in Game.rooms) {
            const Room: Room = Game.rooms[room];
            let owned: boolean = false;
            let list = {};
            let miners = {};
            const hostiles: number = Room.hostiles();
            // If Room is false
            if (!Room || Room === undefined) { continue; }
            // Check ownership
            if (Room.controller && Room.controller!.my) { owned = true; }
            // Init the room
            // Room.init(); // TODO add init
            if (owned) {
                let minCreeps: number = 1;
                let desiredCreeps: number = 4;
                let minMiners: number = 0;
                // If we're greater than level 3, up the limits a little
                if (Room.controller!.level >= 3) {
                    minCreeps = 3;
                    desiredCreeps = 4;
                    minMiners = 1;
                }
                list = _.filter(Game.creeps, (i: Creep) => i.pos.roomName === room && !i.memory.dying &&
                    i.memory.role !== "hauler" && i.memory.role !== "guard");
                miners = _.filter(Game.creeps, (i: Creep) => i.pos.roomName === room && !i.memory.dying &&
                    (i.memory.role === "miner" || i.memory.role === "linkminer"));
                if (!Room.storage) {
                    Room.memory.links = false;
                } else {
                    if (Room.storage.store[RESOURCE_ENERGY] >= global.chargeLimit && Room.memory.charging === true) {
                        Room.memory.charging = false;
                    }

                    if (Room.storage.store[RESOURCE_ENERGY] <= 10000 && Room.memory.charging === false) {
                        Room.memory.charging = true;
                    }

                    if (Room.storage.store[RESOURCE_ENERGY] >= global.linkLimit && Room.memory.links === false) {
                        Room.memory.links = true;
                    }

                    if (Room.storage.store[RESOURCE_ENERGY] <= 100000 && Room.memory.links === true) {
                        Room.memory.links = false;
                    }
                }
            }
        }
    }
}
