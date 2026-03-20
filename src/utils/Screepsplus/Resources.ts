import { countBy, maxBy, minBy, sumBy, sumValues } from "utils/utils";

/**
 * Resources class for gathering details for stats
 */
export class Resources {
    /**
     * Get room Stats
     */
    public static get(): object {
        const now = Game.time;
        if (global.resourcesTimeStamp === now) {
            return global.resources;
        }
        const retval: { [k: string]: any } = {};
        const minerals: { [k: string]: number } = {};
        this.SummarizeRooms(retval, minerals);
        global.resourcesTimeStamp = now;
        global.roomSummary = retval;
        global.minerals = minerals;
        return retval;
    }
    /**
     * Summarize our rooms
     * @param {[k: string]: any} retval
     * @param {[k: string]: number} minerals
     */
    private static SummarizeRooms(
        retval: {[k: string]: any; },
        minerals: {[k: string]: number; }
    ): void {
        for (const name in Game.rooms) {
            const room = Game.rooms[name];
            // if this is a remote room
            if (!room.controller || !room.controller.my) {
                // retval[name + "_remote"] = this.SummarizeRemoteRoom(room);
            } else {
                retval[name] = this.SummarizeMyRoom(room);
                this.AddStorageMinerals(room, minerals);
                this.AddTerminalMinerals(room, minerals);
            }
        }
    }
    /**
     * Summarize down a remote room's stats into an object for memory
     *
     * @param {Room} room
     */
    private static SummarizeRemoteRoom(room: Room): object {
        if (null === room) {
            return {};
        }
        const sources = room.find(FIND_SOURCES);
        const numSources = sources === null ? 0 : sources.length;
        const sourceEnergy = sumBy(sources, (s: Source) => s.energy);
        const creeps = Object.values(Game.creeps).filter((c: Creep) => c.pos.roomName === room.name && c.my);
        const numCreeps = creeps ? creeps.length : 0;
        const creepEnergy = Object.values(Game.creeps).reduce(
            (sum: number, c: Creep) => sum + (c.pos.roomName === room.name ? (c.carry as any)[RESOURCE_ENERGY] : 0), 0
        );
        const enemyCreeps = room.find(FIND_HOSTILE_CREEPS);
        const numEnemies = enemyCreeps ? enemyCreeps.length : 0;
        const constSites = room.find(FIND_CONSTRUCTION_SITES);
        const myConstSites = room.find(FIND_CONSTRUCTION_SITES, {
            filter: (s: ConstructionSite) => s.my
        });
        const numConstructionSites = constSites.length;
        const numMyConstructionSites = myConstSites.length;
        const groundResources = room.find(FIND_DROPPED_RESOURCES);
        const reducedResources = groundResources.reduce((acc: { [k: string]: number }, res) => {
            acc[res.resourceType] = (acc[res.resourceType] ?? 0) + res.amount;
            return acc;
        }, {});
        const creepCounts = countBy(creeps, (c: Creep) => (c as any).role as string);

        const retval = {
            room_name: room.name,
            num_sources : numSources,
            source_energy: sourceEnergy,
            num_creeps: numCreeps,
            creep_counts: creepCounts,
            creep_energy: creepEnergy,
            num_enemies: numEnemies,
            num_construction_sites: numConstructionSites,
            num_my_construction_sites: numMyConstructionSites,
            ground_resources: reducedResources
        };

        return retval;
    }

    /**
     * Summarize one of our own room's stats into an object for memory
     * @param {Room} room
     */
    private static SummarizeMyRoom(room: Room): object {
        if (null === room || undefined === room.controller || !room.controller.my) {
            return {};
        }
        // Dump a bunch of consts
        const controllerLevel               = room.controller.level;
        const controllerProgress            = room.controller.progress;
        const controllerNeeded              = room.controller.progressTotal;
        const controllerRequired            = controllerNeeded - controllerProgress;
        const controllerDowngrade           = room.controller.ticksToDowngrade;
        const controllerBlocked             = room.controller.upgradeBlocked;
        const controllerSafemode            = room.controller.safeMode ? room.controller.safeMode : 0;
        const controllerSafemodeAvail       = room.controller.safeModeAvailable;
        const controllerSafemodeCooldown    = room.controller.safeModeCooldown;
        const hasStorage                    = room.storage != null;
        const storageEnergy                 = room.storage ? room.storage.store[RESOURCE_ENERGY] : 0;
        const storageMinerals               = room.storage ? sumValues(room.storage.store as unknown as Record<string, number>) - storageEnergy : 0;
        const energyAvail                   = room.energyAvailable;
        const energyCap                     = room.energyCapacityAvailable;
        const containers: StructureContainer[] = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_CONTAINER
        }) as StructureContainer[];
        const numContainers                 = containers == null ? 0 : containers.length;
        const containerEnergy               = sumBy(containers, (c: StructureContainer) => c.store[RESOURCE_ENERGY]);
        const sources: Source[]             = room.find(FIND_SOURCES);
        const numSources                    = sources == null ? 0 : sources.length;
        const sourceEnergy                  = sumBy(sources, (s: Source) => s.energy);
        const links: StructureLink[] = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_LINK && s.my
        }) as StructureLink[];
        const numLinks                      = links == null ? 0 : links.length;
        const linkEnergy                    = sumBy(links, (l: StructureLink) => l.energy);
        const minerals                      = room.find(FIND_MINERALS);
        const mineral                       = minerals && minerals.length > 0 ? minerals[0] : null;
        const mineralType                   = mineral ? mineral.mineralType : "";
        const mineralAmount                 = mineral ? mineral.mineralAmount : 0;
        const extractors                    = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_EXTRACTOR
        });
        const numExtractors                 = extractors.length;
        const creeps: Creep[]               = Object.values(Game.creeps).filter((c: Creep) => c.pos.roomName === room.name && c.my);
        const numCreeps                     = creeps ? creeps.length : 0;
        const enemyCreeps: Creep[]          = room.find(FIND_HOSTILE_CREEPS);
        const creepEnergy = Object.values(Game.creeps).reduce(
            (sum: number, c: Creep) => sum + (c.pos.roomName === room.name ? (c.carry as any)[RESOURCE_ENERGY] : 0), 0
        );
        const numEnemies                    = enemyCreeps ? enemyCreeps.length : 0;
        const spawns: StructureSpawn[]      = room.find(FIND_MY_SPAWNS);
        const numSpawns                     = spawns ? spawns.length : 0;
        const spawnsSpawning                = sumBy(spawns, (s: StructureSpawn) => s.spawning ? 1 : 0);
        const towers: StructureTower[] = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_TOWER && s.my
        }) as StructureTower[];
        const numTowers                     = towers ? towers.length : 0;
        const towerEnergy                   = sumBy(towers, (t: StructureTower) => t.energy);
        const constSites                    = room.find(FIND_CONSTRUCTION_SITES);
        const myConstSites = room.find(FIND_CONSTRUCTION_SITES, {
            filter: (cs) => cs.my
        });
        const numConstructionSites          = constSites.length;
        const numMyConstructionSites        = myConstSites.length;
        const numSourceContainers           = this.CountSourceContainers(room);
        const hasTerminal                   = room.terminal != null;
        const terminalEnergy                = room.terminal ? room.terminal.store[RESOURCE_ENERGY] : 0;
        const terminalMinerals              = room.terminal ? sumValues(room.terminal.store as unknown as Record<string, number>) - terminalEnergy : 0;
        const groundResources               = room.find(FIND_DROPPED_RESOURCES);
        const reducedResources              = groundResources.reduce((acc: {[k: string]: number}, res) => {
            acc[res.resourceType] = (acc[res.resourceType] ?? 0) + res.amount;
            return acc;
        }, {});
        const creepCounts = countBy(creeps, (c: Creep) => (c as any).role as string);

        const structures: AnyStructure[] = room.find(FIND_STRUCTURES);
        const structureTypes = structures.map((s) => s.structureType);
        const structureInfo: {[k: string]: object} = {};
        for (const s of structureTypes) {
            const ss = room.find(FIND_STRUCTURES, {
                filter: (str) => str.structureType === s
            });
            structureInfo[s] = {
                count: ss.length,
                max_hits: maxBy(ss, (st) => st.hits)?.hits ?? 0,
                min_hits: minBy(ss, (st) => st.hits)?.hits ?? 0
            };
        }

        const wallMax = room.memory.wallMax || global.wallMax || Memory.wallMax || 1;
        const rampartMax = room.memory.rampartMax || global.rampartMax || Memory.rampartMax || 1;

        const retval = {
            room_name: room.name,
            controller_level : controllerLevel,
            controller_progress: controllerProgress,
            controller_needed: controllerNeeded,
            controller_required: controllerRequired,
            controller_downgrade: controllerDowngrade,
            controller_blocked: controllerBlocked,
            controller_safemode: controllerSafemode,
            controller_safemode_avail: controllerSafemodeAvail,
            controller_safemode_cooldown: controllerSafemodeCooldown,
            energy_avail: energyAvail,
            energy_cap: energyCap,
            num_sources: numSources,
            source_energy: sourceEnergy,
            mineral_type: mineralType,
            mineral_amount: mineralAmount,
            num_extractors: numExtractors,
            has_storage: hasStorage,
            storage_energy: storageEnergy,
            storage_minerals: storageMinerals,
            has_terminal: hasTerminal,
            terminal_energy: terminalEnergy,
            terminal_minerals: terminalMinerals,
            num_containers: numContainers,
            container_energy: containerEnergy,
            num_links: numLinks,
            link_energy: linkEnergy,
            num_creeps: numCreeps,
            creep_counts: creepCounts,
            creep_energy: creepEnergy,
            num_enemies: numEnemies,
            num_spawns: numSpawns,
            spawns_spawning: spawnsSpawning,
            num_towers: numTowers,
            tower_energy: towerEnergy,
            structure_info: structureInfo,
            num_construction_sites: numConstructionSites,
            num_my_construction_sites: numMyConstructionSites,
            ground_resources: reducedResources,
            num_source_containers: numSourceContainers,
            wallMax,
            rampartMax
        };

        return retval;
    }

    /**
     * Checks room for storage and pops it into the minerals object
     *
     * @param {Room} room
     * @param {Object} minerals
     */
    private static AddStorageMinerals(room: Room, minerals: { [k: string]: number }): void {
        if (!room.storage) { return; }
        for (const i in room.storage.store) {
            if (minerals[i] === undefined) {
                minerals[i] = 0;
            }
            minerals[i] += room.storage.store[i as ResourceConstant] ?? 0;
        }
    }

    /**
     * Checks room for terminal then adds to the minerals object
     *
     * @param {Room} room
     * @param {Object} minerals
     */
    private static AddTerminalMinerals(room: Room, minerals: { [k: string]: number }): void {
        if (!room.terminal) { return; }
        for (const i in room.terminal.store) {
            if (minerals[i] === undefined) {
                minerals[i] = 0;
            }
            minerals[i] += room.terminal.store[i as ResourceConstant] ?? 0;
        }
    }

    /**
     * Counts adjacent containers to sources
     * @param {Room} room
     */
    private static CountSourceContainers(room: Room): number {
        const roomSources = room.find(FIND_SOURCES);
        let retval = 0;

        for (const source of roomSources) {
            const nearbyContainers = source.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: (s: AnyStructure) => s.structureType === STRUCTURE_CONTAINER
            });
            for (const nc of nearbyContainers) {
                if (nc.pos.getRangeTo(source) >= 2.0) {
                    continue;
                }
                retval++;
            }
        }
        return retval;
    }
}
