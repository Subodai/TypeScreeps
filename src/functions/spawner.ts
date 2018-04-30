import { ROLES } from "config/constants";
import * as STATE from "config/states";
import { Builder } from "roles/Builder";
import { Harvester } from "roles/Harvester";
import { Miner } from "roles/Miner";
import { Refiller } from "roles/Refiller";
import { RemoteEnergyHauler } from "roles/RemoteEnergyHauler";
import { Supergrader } from "roles/Supergrader";
import { Upgrader } from "roles/Upgrader";
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

    private static checkForSpawns(): void {
        for (const spawn in Game.spawns) {
            const Spawn: StructureSpawn = Game.spawns[spawn];
            if (Spawn.spawning) {
                Spawn.log("Already Spawning");
                continue;
            }
            const Room = Spawn.room;
            let spawned = false;
            for (const i in ROLES) {
                // if we've spawned something, stop
                if (spawned) { break; }
                // get the roleName
                const roleName: string = ROLES[i];
                Spawn.log("Checking for role " + roleName);
                // skip if this role is disabled
                if (!Room.memory.roles[roleName]) {
                    Spawn.log("Role not enabled " + roleName);
                    continue;
                }
                Spawn.log("Role enabled, checking for spawn routine");
                // Switch on type (for now)
                switch (roleName) {
                    // Miners
                    case Miner.roleName:
                        Spawn.log("Role found, running spawn routine");
                        spawned = this.spawnRoutine(Miner, Spawn);
                        break;

                    // Harvesters
                    case Harvester.roleName:
                        Spawn.log("Role found, running spawn routine");
                        spawned = this.spawnRoutine(Harvester, Spawn);
                        break;

                    // Upgraders
                    case Upgrader.roleName:
                        Spawn.log("Role found, running spawn routine");
                        spawned = this.spawnRoutine(Upgrader, Spawn);
                        break;

                    // Supergraders
                    case Supergrader.roleName:
                        Spawn.log("Role found, runnning spawn routine");
                        spawned = this.spawnRoutine(Supergrader, Spawn);
                        break;

                    // Builders
                    case Builder.roleName:
                        Spawn.log("Role found, running spawn routine");
                        spawned = this.spawnRoutine(Builder, Spawn);
                        break;

                    // Refillers
                    case Refiller.roleName:
                        Spawn.log("Role found, running spawn routine");
                        spawned = this.spawnRoutine(Refiller, Spawn);
                        break;

                    // Remote Energy Hauler
                    case RemoteEnergyHauler.roleName:
                        Spawn.log("Role found, running spawn route");
                        spawned = this.spawnRoutine(RemoteEnergyHauler, Spawn);
                        break;
                    default:
                        break;
                }
            }
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
