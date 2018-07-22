import { Builder } from "roles/Builder";
import { Miner } from "roles/Miner";
import { RemoteEnergyHauler } from "roles/RemoteEnergyHauler";
import { Debug } from "./debug";

export class Counter {
    private static runEvery: number = 1;
    private static runSetupEvery: number = 5;
    private static runHaulerSetupEvery: number = 200;
    // private static notify: boolean = false;

    /**
     * Run the main counter
     */
    public static run(): void {
        if (Game.time % this.runEvery === 0) {
            Debug.Log("Running Counter");
            const cpu: number = Game.cpu.getUsed();
            this.runCount();
            Debug.Log("Counter used " + (Game.cpu.getUsed() - cpu).toFixed(3) + "CPU");
        }
    }

    private static runCount(): void {
        // Loop through all rooms
        for (const room in Game.rooms) {
            const Room: Room = Game.rooms[room];
            let owned: boolean = false;
            let list = [];
            let miners = [];
            Room.countEnemies();
            const hostiles: number = Room.memory.hostiles || 0;
            if (hostiles > 0) {
                // Room.attackEnemiesWithTowers();
            }
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
                    i.role !== RemoteEnergyHauler.roleName &&
                    i.role !== Builder.roleName &&
                    i.role !== "guard"); // TODO replace with hauler and guard rolenames
                miners = _.filter(Game.creeps, (i: Creep) => i.pos.roomName === room && !i.memory.dying &&
                    (i.role === Miner.roleName || i.role === "linkminer")); // TODO replace with linkMiner rolename?
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
            if (Game.time % this.runSetupEvery === 0) {
                // Run build flags
                Room.processBuildFlags();
                // Run role setup
                Room.roleSetup();
                // Run source setup
                Room.sourceSetup();
                // Run mineral setup
                Room.mineralSetup();
            }
            if (Game.time % this.runHaulerSetupEvery === 0) {
                this.RunHaulerSetup();
            }
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

    /**
     * Hauler setup
     */
    public static RunHaulerSetup(): void {
        Debug.Log("Running Hauler Target setup");
        const Before = Game.cpu.getUsed();

        // Check the level of the energy in the current target
        const target = Game.rooms[Memory.remoteRoom];
        // if the room has less than 500 energy, lets pick a different one
        if (!target || target.collectableEnergy() <= 500 || target.hostiles() > 0) {
            Debug.Log("picking new room");
            const remoteRooms = [];
            for (const room in Game.rooms) {
                const _room = Game.rooms[room];
                if (_room != null) {
                    if (!_room.controller || (_room.controller && !_room.controller.my)) {
                        // If there are no hostiles, send the haulers!
                        if (_room.hostiles() <= 0) {
                            remoteRooms.push(_room.name);
                        }
                    }
                }
            }
            const remoteRoom = _.max(remoteRooms, (c) => Game.rooms[c].collectableEnergy());
            Memory.remoteRoom = remoteRoom;
        } else {
            Debug.Log(Memory.remoteRoom + ":" + target.collectableEnergy());
        }
        // // Now reset haulers with this remoteRoom
        // let creeps = _.filter(Game.creeps, c => c.memory.role === 'hauler');
        // for(let i in creeps) {
        //     let c = creeps[i];
        //     if (_.sum(c.carry) < c.carryCapacity && c.carryCapacity > 0) {
        //         if (c.memory.remoteRoom !== Memory.remoteRoom) {
        //             Debug.Log('[MEMORY] Clearing hauler [' + c.name + '] target because room empty');
        //             c.memory.remoteRoom = Memory.remoteRoom;
        //             delete c.memory.arrived;
        //             delete c.memory.energyPickup;
        //         }
        //     }
        // }
        // Get a list of our rooms
        if (Game.rooms[Memory.myRoom]) {
            if (Game.rooms[Memory.myRoom].storage) {
                if (Game.rooms[Memory.myRoom].storage!.store[RESOURCE_ENERGY] < 50000) {
                    return;
                }
            }
        }
        let myRooms = [];
        for (const room in Game.rooms) {
            if (Game.rooms[room].controller) {
                if (Game.rooms[room].controller!.my) {
                    if (Game.rooms[room].memory.charging && Game.rooms[room].storage) {
                        myRooms.push(room);
                    }
                }
            }
        }
        if (myRooms.length === 0) {
            myRooms.push("E18N4");
        }
        myRooms = _.filter(myRooms, (c) => Game.rooms[c].storage);
        const myRoom = _.min(myRooms, (c) => Game.rooms[c].storage!.store[RESOURCE_ENERGY]);
        Memory.myRoom = myRoom;
        const After = Game.cpu.getUsed() - Before;
        Debug.Log("Hauler Target setup used " + After + " CPU");
    }
}
