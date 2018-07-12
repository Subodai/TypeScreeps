import * as STATE from "config/states";
import { Builder } from "roles/Builder";
import { Harvester } from "roles/Harvester";
import { Miner } from "roles/Miner";
import { MineralExtractor } from "roles/MineralExtractor";
import { Refiller } from "roles/Refiller";
import { RemoteClaimer } from "roles/RemoteClaimer";
import { RemoteEnergyHauler } from "roles/RemoteEnergyHauler";
import { RemoteEnergyMiner } from "roles/RemoteEnergyMiner";
import { RemoteReserver } from "roles/RemoteReserver";
import { Upgrader } from "roles/Upgrader";

/**
 * Convert old creep types to new ones
 */
export function convertOldData(): void {
    if (Memory.converted && Memory.converted === true) {
        console.log("Already Converted");
        return;
    }
    clearMemory();
    convertCreeps();
    Memory.converted = true;
}

function clearMemory(): void {
    console.log("Clearing and converting Memory");
    Memory._rooms = Memory.rooms;
    delete Memory.rooms;

    Memory._structures = Memory.structures;
    delete Memory.structures;

    Memory._sources = Memory.sources;
    delete Memory.sources;

    Memory._stats = Memory.stats;
    delete Memory.stats;

    Memory._queue = Memory.queue;
    delete Memory.queue;

    delete Memory.profiler;
}

function convertCreeps(): void {
    Memory._creeps = Memory.creeps;
    console.log("Converting old creeps");
    const creeps = _.filter(Game.creeps);
    for (const creep of creeps) {
        switch (creep.memory.role) {
            case "builder":
                switchBuilder(creep);
                break;
            case "extractor":
                switchExtractor(creep);
                break;
            case "hauler":
                switchHauler(creep);
                break;
            case "miner":
                switchMiner(creep);
                break;
            case "refill":
                switchRefiller(creep);
                break;
            case "remoteminer":
                switchRemoteMiner(creep);
                break;
            case "reserve":
                switchReserver(creep);
                break;
            case "scout":
                switchScout(creep);
                break;
            case "supergrader":
            case "upgrader":
                switchUpgrader(creep);
                break;
            case "harvester":
            case "mharvester":
            default:
                switchHarvester(creep);
                break;
        }
    }
}

function switchBuilder(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: Builder.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}

function switchExtractor(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: MineralExtractor.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}

function switchHarvester(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: Harvester.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}

function switchHauler(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: RemoteEnergyHauler.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}

function switchMiner(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: Miner.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}

function switchRefiller(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: Refiller.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}

function switchRemoteMiner(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: RemoteEnergyMiner.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}

function switchReserver(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: RemoteReserver.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}

function switchScout(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: RemoteClaimer.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}

function switchUpgrader(creep: Creep): void {
    const mem = {
        level: creep.memory.level,
        role: Upgrader.roleName,
        roomName: creep.memory.roomName,
        state: STATE._SPAWN
    };
    creep.memory = mem;
}
