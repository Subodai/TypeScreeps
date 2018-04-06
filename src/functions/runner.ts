import { ROLES } from "config/constants";
import { Debug } from "functions/debug";
import { Harvester } from "roles/Harvester";
import { Miner } from "roles/Miner";
import { Supergrader } from "roles/Supergrader";
import { Upgrader } from "roles/Upgrader";

export class Runner {
    private static runEvery: number = 1;
    private static softLimit: number = 2;

    public static run(): void {
        if (Game.time % this.runEvery === 0) {
            Debug.Log("Runner Start");
            const cpu: number = Game.cpu.getUsed();
            this.creeps();
            this.rooms();
            Debug.Log("Runner Finished used " + (Game.cpu.getUsed() - cpu).toFixed(3) + " CPU");
        }
    }

    private static creeps(): void {
        Debug.Log("Running Creeps");
        for (const i in ROLES) {
            this.role(ROLES[i]);
        }
    }

    private static rooms(): void {
        Debug.Log("Running Rooms");
    }

    private static role(role: string): boolean {
        // Grab the creeps
        const creeps = _.filter(Game.creeps, (c: Creep) => c.role === role);
        // switch based on role
        switch (role) {
            // Harvesters
            case Harvester.roleName:
                for (const creep of creeps) {
                    Harvester.run(creep);
                }
                break;
            // Miners
            case Miner.roleName:
                for (const creep of creeps) {
                    Miner.run(creep);
                }
                break;
            // Upgraders
            case Upgrader.roleName:
                for (const creep of creeps) {
                    Upgrader.run(creep);
                }
                break;
            // Supergraders
            case Supergrader.roleName:
                for (const creep of creeps) {
                    Supergrader.run(creep);
                }
                break;
            default:
                break;
        }
        // for (const name in Game.creeps) {
        //     const worker = Game.creeps[name];
        //     if (worker.state === STATE_SPAWN) {

        //     }
        // }
        return true;
    }
}
