import { Debug } from "functions/debug";
import { Builder } from "roles/Builder";
import { Courier } from "roles/Courier";
import { Destroyer } from "roles/Destroyer";
import { Harvester } from "roles/Harvester";
import { Janitor } from "roles/Janitor";
import { Linker } from "roles/Linker";
import { Miner } from "roles/Miner";
import { MineralExtractor } from "roles/MineralExtractor";
import { Refiller } from "roles/Refiller";
import { RemoteClaimer } from "roles/RemoteClaimer";
import { RemoteEnergyHauler } from "roles/RemoteEnergyHauler";
import { RemoteEnergyMiner } from "roles/RemoteEnergyMiner";
import { RemoteReserver } from "roles/RemoteReserver";
import { Scientist } from "roles/Scientist";
import { Upgrader } from "roles/Upgrader";

export const ROLES: string[] = [
    // "guard",
    Miner.roleName,
    Refiller.roleName,
    Linker.roleName,
    Harvester.roleName,
    Upgrader.roleName,
    Builder.roleName,

    // mid priority roles
    Janitor.roleName,
    Destroyer.roleName,
    Scientist.roleName,
    MineralExtractor.roleName,

    // Remote roles

    RemoteClaimer.roleName,
    RemoteEnergyMiner.roleName,
    RemoteReserver.roleName,
    RemoteEnergyHauler.roleName,
    Courier.roleName
];

export const ROLEMODELS: Role[] = [
    Miner,
    Refiller,
    Linker,
    Harvester,
    Upgrader,
    Builder,
    Janitor,
    Destroyer,
    Scientist,
    MineralExtractor,
    RemoteClaimer,
    RemoteEnergyMiner,
    RemoteReserver,
    RemoteEnergyHauler,
    Courier
];

export function loadConstants(): void {
    // Debug
    Debug.Load("Config: Empire Constants");

    global.seedRemoteRoads = true;
    global.cpuDesired = 5000;
    global.rampartMax = Memory.rampartMax ? Memory.rampartMax : 10000;
    global.wallMax = Memory.wallMax ? Memory.wallMax : 100000;
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
