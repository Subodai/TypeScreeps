import { Debug } from "functions/debug";

export const ROLES: string[] = [
    // "guard",
    "Miner",
    // "refill",       // Always pulls from storage
    "Harvester"    // Sources and containers always, fill spawns until 4, then only storage
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

export const STATE_SPAWN: CreepState = 0;
export const STATE_INIT: CreepState = 1;
export const STATE_MOVE: CreepState = 2;
export const STATE_ARRIVED: CreepState = 3;
export const STATE_DELIVER: CreepState = 4;
export const STATE_DONE: CreepState = 5;

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
    global.rampartMax = 100000;
    global.wallMax = 700000;
    global.towerRepair = true;
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
}
