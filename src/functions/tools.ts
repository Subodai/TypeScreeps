import { Debug } from "./debug";

export function CalcBodyCost(body: BodyPartConstant[]): number {
    let sum = 0;
    for (const part of body) {
        sum += BODYPART_COST[part];
    }
    return sum;
}

export function loadTools(): void {
    Debug.Load("Tools: Global Functions");
    /*
     TODO Maybe put this on the source itself?
    global.getSpaceAtSource = function(source: Source, creep) {
        const n = new RoomPosition(source.pos.x, source.pos.y - 1, source.pos.roomName);
        if (global.checkEmptyCoord(n, creep)) { return true; }
        const ne = new RoomPosition(source.pos.x + 1, source.pos.y - 1, source.pos.roomName);
        if (global.checkEmptyCoord(ne, creep)) { return true; }
        const e = new RoomPosition(source.pos.x + 1, source.pos.y, source.pos.roomName);
        if (global.checkEmptyCoord(e, creep)) { return true; }
        const se = new RoomPosition(source.pos.x + 1, source.pos.y + 1, source.pos.roomName);
        if (global.checkEmptyCoord(se, creep)) { return true; }
        const s = new RoomPosition(source.pos.x, source.pos.y + 1, source.pos.roomName);
        if (global.checkEmptyCoord(s, creep)) { return true; }
        const sw = new RoomPosition(source.pos.x - 1, source.pos.y + 1, source.pos.roomName);
        if (global.checkEmptyCoord(sw, creep)) { return true; }
        const w = new RoomPosition(source.pos.x - 1, source.pos.y, source.pos.roomName);
        if (global.checkEmptyCoord(w, creep)) { return true; }
        const nw = new RoomPosition(source.pos.x - 1, source.pos.y - 1, source.pos.roomName);
        if (global.checkEmptyCoord(nw, creep)) { return true; }
        return false;
    }

    global.checkEmptyCoord = function (pos, creep) {
        const terrain = Game.map.getTerrainAt(pos);
        if (terrain == 'wall') {
            return false;
        } else {
            let creeps = pos.lookFor(LOOK_CREEPS);
            if (creeps.length == 0) {
                return true;
            } else {
                // is this, the creep we're trying to find a space for
                if (creeps[0] == creep) {
                    return true;
                }
            }
        }
    }
    */

    // tslint:disable-next-line:only-arrow-functions
    global.toggleWar = function() {
        if (!Memory.war) {
            Memory.war = true;
        } else {
            Memory.war = false;
        }
        for (const room in Game.rooms) {
            Debug.Room("Settings war to " + Memory.war, Game.rooms[room]);
            Game.rooms[room].memory.war = Memory.war;
        }
    };

    // tslint:disable-next-line:only-arrow-functions
    global.InitRespawn = function(MeanIt = false) {
        if (MeanIt) {
            Debug.Log("Hope you meant it, because nuking everything");
            Debug.Log("--Killing off creeps--");
            for (const name in Game.creeps) {
                const creep = Game.creeps[name];
                Debug.Log("Creep [" + name + "] Committing Suicide: " + creep.suicide());
            }
            delete Memory.creeps;
            Debug.Log("--Creeps murdered--");

            Debug.Log("--Removing Flags--");
            for (const flag in Game.flags) {
                Debug.Log("Removing flag: " + flag);
                Game.flags[flag].remove();
            }
            delete Memory.flags;
            Debug.Log("--Flags cleared--");

            Debug.Log("--Removing construction sites--");
            const mySites: ConstructionSite[] = _.filter(Game.constructionSites, (site: ConstructionSite) => site.my);
            for (const site in mySites) {
                mySites[site].remove();
            }
            Debug.Log("--Construction Sites removed--");

            Debug.Log("--Clearing Structure Memory--");
            for (const room in Game.rooms) {
                const structures = Game.rooms[room].find(FIND_STRUCTURES);
                for (const s in structures) {
                    structures[s].destroy();
                }
            }
            delete Memory.structures;
            Debug.Log("--Structure Memory Cleared--");

            Debug.Log("--Clearing Memory Stats--");
            delete Memory.stats;
            Debug.Log("--Stats Memory Cleared--");

            Debug.Log("--Clearing Queue Memory--");
            delete Memory.queue;
            Debug.Log("--Queue Memory Cleared");

            Debug.Log("--Clearing remaining memory");
            delete Memory.myRoom;
            delete Memory.sources;
            Debug.Log("--Remaining Memory Clear");

            Debug.Log("++Respawn Cleanup Complete++");
            Debug.Log("++Good Luck!!++");

            Game.notify("Performed a Respawn Memory Reset");
        } else {
            Debug.Log("You clearly did not mean that, ignoring you");
        }
    };

    // tslint:disable-next-line:only-arrow-functions
    global.haulerSetup = function() {
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
            myRooms.push("E12N6");
        }
        myRooms = _.filter(myRooms, (c) => Game.rooms[c].storage);
        const myRoom = _.min(myRooms, (c) => Game.rooms[c].storage!.store[RESOURCE_ENERGY]);
        Memory.myRoom = myRoom;
        const After = Game.cpu.getUsed() - Before;
        Debug.Log("Hauler Target setup used " + After + " CPU");
    };

    // tslint:disable-next-line:only-arrow-functions
    global.initDrain = function(): string {
        for (const room in Game.rooms) {
            Game.rooms[room].drain();
        }
        return "Drain Initiated";
    };

    // tslint:disable-next-line:only-arrow-functions
    global.cancelDrain = function(): string {
        for (const room in Game.rooms) {
            Game.rooms[room].stopDrain();
        }
        return "Drain Stopped";
    };

    // tslint:disable-next-line:only-arrow-functions
    global.pause = function(lineNo: number = 0): void {
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) {
            Debug.Log("Stopping At " + lineNo + " To relax CPU use");
            let msg = Game.time + ":CPU:[" + Game.cpu.tickLimit + "] ";
            msg += "[" + Game.cpu.bucket + "] [" + Game.cpu.getUsed().toFixed(3) + "]";
            Debug.Log(msg);
            return;
        }
    };

    // tslint:disable-next-line:only-arrow-functions
    global.hex = function(d: number, padding?: number) {
        let hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
        while (hex.length < padding) { hex = "0" + hex; }
        return hex;
    };

    // tslint:disable-next-line:only-arrow-functions
    global.setupFeedRoom = function(): string {
        if (Memory.feedRoom) {
            const energy = Game.rooms[Memory.feedRoom].storage!.store[RESOURCE_ENERGY];
            if (energy >= global.chargeLimit) {
                delete Memory.feedRoom;
            }
        }
        if (!Memory.feedRoom) {
            const myRooms = _.filter(Game.rooms, (r) => r.controller && r.controller.my);
            Debug.Log(JSON.stringify(myRooms));
            const room = _.min(myRooms, (r) => {
                if (!r || !r.storage || !r.terminal) {
                    return 10000000;
                } else {
                    return r.storage.store[RESOURCE_ENERGY] + r.terminal.store[RESOURCE_ENERGY];
                }
            });
            Memory.feedRoom = room.name;
        }
        return Memory.feedRoom;
    };
}

export function BodyBuilder(config: {[key: string]: number}): BodyPartConstant[] {
    const body: BodyPartConstant[] = [];
    for (const partType in config) {
        const amount = config[partType];
        for (let i = 0; i < amount; i++) {
            body.push(partType.toLowerCase() as BodyPartConstant);
        }
    }
    return body;
}
