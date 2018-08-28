import { ROLEMODELS, ROLES } from "config/constants";
import * as STATE from "config/states";
import { Debug } from "./debug";
import { CalcBodyCost } from "./tools";

export class Spawner {
    private static runEvery: number = 10;

    public static run(): void {
        if (Game.time % this.runEvery === 0) {
            Debug.Log("Running Spawner");
            const cpu: number = Game.cpu.getUsed();
            this.checkForSpawns();
            Debug.Log("Spawner used " + (Game.cpu.getUsed() - cpu).toFixed(3) + " CPU");
        }
    }

    /**
     * Check for available spawns
     */
    private static checkForSpawns(): void {
        const spawnedCreeps: {[k: string]: {[k: string]: boolean}} | null = {};
        for (const spawn in Game.spawns) {
            const Spawn: StructureSpawn = Game.spawns[spawn];
            if (Spawn.memory.spawnType &&
                Spawn.memory.spawnType === "renewer" &&
                Spawn.room.memory.links === true &&
                Spawn.room.memory.charging === false) {
                    continue;
            }
            if (Spawn.spawning) {
                Spawn.log("Already Spawning");
                continue;
            }
            const Room = Spawn.room;
            if (spawnedCreeps[Room.name] === undefined) {
                spawnedCreeps[Room.name] = {};
            }
            let spawned = false;

            let handler: Role;
            for (handler of ROLEMODELS) {
                if (spawned) { break; }
                const roleName: string = handler.roleName;
                if (spawnedCreeps[Room.name][roleName] !== undefined) {
                    Spawn.log(roleName + " Is already being spawned by this room");
                    break;
                }
                Spawn.log("Checking for role " + roleName);
                if (!Room.memory.roles[roleName]) {
                    Spawn.log("Role not enabled " + roleName);
                    continue;
                }
                Spawn.log("Role " + roleName + " found, running spawn routine");
                spawned = this.spawnRoutine(handler, Spawn);
                if (spawned) {
                    spawnedCreeps[Room.name][roleName] = true;
                }
            }
            Spawn.log("SpawnedCreeps" + JSON.stringify(spawnedCreeps));
        }
    }

    private static spawnRoutine(Role: CreepRole, Spawn: StructureSpawn): boolean {
        const Room = Spawn.room;
        let level = Room.controller!.level;
        if (Room.memory.emergency) {
            Spawn.log("In emergency, defaulting to level 1");
            level = 1;
        }

        let bodyStructure = Role.bodyStructure;
        if (Room.memory.links && Role.bodyStructureLinks) {
            bodyStructure = Role.bodyStructureLinks;
        }

        let roster = Role.roster;
        if (Room.memory.links && Role.rosterLinks) {
            roster = Role.rosterLinks;
        }
        // Get the appropriate level of creep for this room (when upgrading rooms we have less)
        while (Room.energyCapacityAvailable < CalcBodyCost(bodyStructure[level])) { level--; }
        // Make sure it's minimum level 1
        level = _.max([level, 1]);
        Spawn.log("Able to spawn level " + level + " Creep");
        // Get the list of these creeps
        const list = _.filter(Game.creeps, (c) => c.role === Role.roleName &&
                                                  c.memory.roomName === Room.name &&
                                                  c.memory.level === level &&
                                                 !c.memory.dying);
        Spawn.log("Found [" + list.length + "/" + roster[level] + "] Creeps");
        // Do we already have enough of these creeps
        if (list.length >= roster[level]) {
            Spawn.log("Already enough creeps");
            return false;
        }
        // Get the partCost of this creep at this level
        const partCost = CalcBodyCost(bodyStructure[level]);
        // do we have enough energy?
        if (Room.energyAvailable < partCost) {
            Spawn.log("Not enough energy [" + Room.energyAvailable + "/" + partCost + "]");
            return false;
        }
        // make a name
        const name = `${Role.roleName}_${level}_${Room.name}_${Math.floor(Math.random() * 100)}`;
        Spawn.log("Attempting to Spawn " + name);
        // Try spawning
        Spawn.log("Spawning:" + JSON.stringify(bodyStructure[level]));
        const result = Spawn.spawnCreep(bodyStructure[level], name, {
            memory: {
                boosted: false,
                level,
                role: Role.roleName,
                roomName: Room.name,
                state: STATE._SPAWN
            }
        });
        Spawn.log(JSON.stringify(result));
        Spawn.log(Role.roleName + " Creep Spawned: " + name);
        // we did it!
        return true;
    }
}
