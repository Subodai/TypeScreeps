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
];

export function loadConstants(): void {
    // Debug
    Debug.Load("Config: Empire Constants");

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

    global.statsEnabled = true;
}
