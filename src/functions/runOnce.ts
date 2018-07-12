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

    Memory._creeps = Memory.creeps;
    console.log("Converting old creeps");
    const creeps = _.filter(Game.creeps);
    for (const creep of creeps) {
        switch (creep.memory.role) {
            case "builder":
                const mem1 = {
                    level: creep.memory.level,
                    role: Builder.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem1;
                break;

            case "extractor":
                const mem2 = {
                    level: creep.memory.level,
                    role: MineralExtractor.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem2;
                break;

            case "harvester":
            case "mharvester":
                const mem3 = {
                    level: creep.memory.level,
                    role: Harvester.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem3;
                break;

            case "hauler":
                const mem4 = {
                    level: creep.memory.level,
                    role: RemoteEnergyHauler.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem4;
                break;

            case "miner":
                const mem5 = {
                    level: creep.memory.level,
                    role: Miner.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem5;
                break;

            case "refill":
                const mem6 = {
                    level: creep.memory.level,
                    role: Refiller.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem6;
                break;

            case "remoteminer":
                const mem7 = {
                    level: creep.memory.level,
                    role: RemoteEnergyMiner.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem7;
                break;

            case "reserve":
                const mem8 = {
                    level: creep.memory.level,
                    role: RemoteReserver.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem8;
                break;

            case "scout":
                const mem9 = {
                    level: creep.memory.level,
                    role: RemoteClaimer.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem9;
                break;

            case "supergrader":
            case "upgrader":
                const mem10 = {
                    level: creep.memory.level,
                    role: Upgrader.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem10;
                break;
            default:
                const mem11 = {
                    level: creep.memory.level,
                    role: Harvester.roleName,
                    roomName: creep.memory.roomName,
                    state: STATE._SPAWN
                };
                creep.memory = mem11;
                break;
        }
    }
    Memory.converted = true;
}
