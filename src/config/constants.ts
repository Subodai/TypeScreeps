import { Debug } from "functions/debug";
import { Builder } from "roles/Builder";
import { Harvester } from "roles/Harvester";
import { Janitor } from "roles/Janitor";
import { Miner } from "roles/Miner";
import { MineralExtractor } from "roles/MineralExtractor";
import { Refiller } from "roles/Refiller";
import { RemoteClaimer } from "roles/RemoteClaimer";
import { RemoteEnergyHauler } from "roles/RemoteEnergyHauler";
import { RemoteEnergyMiner } from "roles/RemoteEnergyMiner";
import { RemoteReserver } from "roles/RemoteReserver";
import { Upgrader } from "roles/Upgrader";

export const ROLES: string[] = [
    // "guard",
    Miner.roleName,
    Refiller.roleName,
    Harvester.roleName,
    Upgrader.roleName,
    Builder.roleName,

    // mid priority roles
    Janitor.roleName,
    MineralExtractor.roleName,

    // Remote roles
    RemoteClaimer.roleName,
    RemoteEnergyMiner.roleName,
    RemoteReserver.roleName,
    RemoteEnergyHauler.roleName

    // "refill",       // Always pulls from storage
    // "Harvester",    // Sources and containers always, fill spawns until 4, then only storage
    // "Upgrader",     // Sources until 4, storage after
    // "builder",      // Sources until 4, storage after
    // // 'janitor',      // Sources until 4, storage after
    // "extractor",
    // "mharvester",
    // "supergrader",  // Storage always
    // "scout",
    // "reserve",
    // "remoteminer",
    // "hauler"
];

export function loadConstants(): void {
    // Debug
    Debug.Load("Config: Empire Constants");

    // Define our list of roles
    global.roles = [
        // "guard",
        "Miner"// ,
        // "refill",       // Always pulls from storage
        // "harvester",    // Sources and containers always, fill spawns until 4, then only storage
        // "upgrader",     // Sources until 4, storage after
        // "builder",      // Sources until 4, storage after
        // // 'janitor',      // Sources until 4, storage after
        // "extractor",
        // "mharvester",
        // "supergrader",  // Storage always
        // "scout",
        // "reserve",
        // "remoteminer",
        // "hauler"
    ];

    global.seedRemoteRoads = true;
    global.cpuDesired = 5000;
    global.rampartMax = 10000;
    global.wallMax = 100000;
    global.towerRepair = false;
    global.linkLimit = 980000;
    global.chargeLimit = 980000;

    global.resourceList = [
        // Minerals
        RESOURCE_CATALYST,
        RESOURCE_HYDROGEN,
        RESOURCE_LEMERGIUM,
        RESOURCE_UTRIUM,
        RESOURCE_KEANIUM,
        RESOURCE_OXYGEN,

        // Compounds (from invaders)
        RESOURCE_UTRIUM_HYDRIDE,
        RESOURCE_KEANIUM_OXIDE,
        RESOURCE_ZYNTHIUM_HYDRIDE,
        RESOURCE_GHODIUM_OXIDE,

        // Energy!
        RESOURCE_ENERGY
    ];

    global.statsEnabled = false;
}
