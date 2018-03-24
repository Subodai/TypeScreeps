import { Debug } from "./debug";

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
            let list = [];
            let miners = [];
            const hostiles: number = Room.hostiles();
            // If Room is false
            if (!Room || Room === undefined) { continue; }
            // Check ownership
            if (Room.controller && Room.controller!.my) { owned = true; }
            // Init the room
            Room.init();
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

                // If we're not in emergency mode
                if (!Room.memory.emergency) {
                    if (list.length <= minCreeps || miners.length < minMiners) {
                        // activate emergency mode
                        Room.memory.emergency = true;
                        Room.log("Emergency Activated");
                    }
                } else {
                    // Are we above the desired levels?
                    if (list.length >= desiredCreeps && miners.length >= minMiners) {
                        // Deactivate emergency mode
                        delete Room.memory.emergency;
                        Room.log("Emergency Deactivated");
                    }
                }

                if (Room.memory.emergency) {
                    // if in emergency mode, reset prioritise!
                    Room.memory.prioritise = "none";
                    Room.log("Still in emergency with " + list.length + " creeps and " + miners.length + " miners");
                }

                if (hostiles > 0 && Room.memory.mode === "normal") {
                    Room.memory.mode = "guard";
                    Room.log("Put into guard mode");
                }

                if (hostiles === 0 && Room.memory.mode === "guard") {
                    Room.memory.mode = "normal";
                    Room.log("No longer in guard mode");
                }

                if (Room.memory.mode === "guard") {
                    Room.log("Still in guard mode");
                }
                Room.log("Energy Available " + Room.energyAvailable);
            } else {
                // non owned rooms can never be in emergency
                delete Room.memory.emergency;
                // TODO We should add a tick counter to remove this hostile flag
                //  based on the life time of the hostile creeps in it
                if (hostiles > 0 && Room.memory.mode === "safe") {
                    Room.memory.mode = "hostile";
                    Room.log("Remote Room has gone Hostile");
                }
                if (hostiles === 0 && Room.memory.mode === "hostile") {
                    Room.memory.mode = "safe";
                    Room.log("Remote Room is now Safe");
                }
                if (Room.memory.mode === "hostile") {
                    Room.log("Remote Room is still Hostile");
                }
            }
            Room.processBuildFlags();
        }
    }

    /**
     * Run the room feed
     */
    public static runRoomFeed(): void {
        Debug.Log("Feeding: ");
        const terminal = Game.rooms[Memory.feedRoom].terminal;
        if (_.sum(terminal!.store) >= terminal!.storeCapacity) {
            Debug.Log("Feed Room Terminal Full Turning off feed");
            this.clearRoomFeed();
            Memory.feedEnabled = false;
            return;
        }
        Debug.Log("Feed Room at " + _.sum(terminal!.store) + " Continuing feed");
        for (const room in Game.rooms) {
            if (Game.rooms[room].terminal && Game.rooms[room].memory.charging === true) {
                Game.rooms[room].feedEnergy();
            }
        }
    }

    /**
     * Clear the room feed
     */
    public static clearRoomFeed(): void {
        if (Memory.feedRoom) {
            delete Memory.feedRoom;
            for (const room in Game.rooms) {
                if (Game.rooms[room].terminal) {
                    Game.rooms[room].memory.prioritise = "none";
                }
            }
        }
    }
}
