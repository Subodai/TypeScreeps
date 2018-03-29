import { Miner } from "./../roles/Miner";
import { Debug } from "./debug";

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
                continue;
            }
            const Room = Spawn.room;
            let spawned = false;
            for (const i in global.roles) {
                // if we've spawned something, stop
                if (spawned) { break; }
                // get the roleName
                const roleName: string = global.roles[i];
                // skip if this role is disabled
                if (!Room.memory.roles.roleName) { continue; }
                // Switch on type (for now)
                switch (roleName) {
                    // Miners
                    case Miner.roleName:
                        spawned = this.spawnRoutine(Miner, Spawn);
                        break;

                    default:
                        break;
                }
            }
        }
    }

    private static spawnRoutine(Role: CreepRole, Spawn: StructureSpawn): boolean {
        const Room = Spawn.room;
        let spawned = false;
        let level = Room.controller!.level;
        if (Room.memory.emergency) {
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

        while (Room.energyCapacityAvailable < global.getPartsCost(bodyStructure[level])) { level--; }
        level = _.min([level, 1]);

        const list = _.filter(Game.creeps, (c) => c.memory.role === Role.roleName &&
                                                  c.memory.roomName === Room.name &&
                                                  c.memory.level === level &&
                                                 !c.memory.dying);

        if (Room.energyAvailable >= global.getPartsCost(bodyStructure[level]) &&
        list.length < roster[level] && !spawned) {
            const name = `${Role.roleName}_${Room.name}_${Math.floor(Math.random() * 100)}`;
            Spawn.spawnCreep(bodyStructure[level], name, {
                memory: {
                    level,
                    role: Role.roleName,
                    roomName: Room.name,
                    state: STATE_SPAWN
                }
            });
            spawned = true;
        }

        if (spawned) {
            Debug.Log(Role.roleName + " Creep Spawned");
            return true;
        } else {
            return false;
        }
    }
}
