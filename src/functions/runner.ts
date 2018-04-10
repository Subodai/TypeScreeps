import { ROLES } from "config/constants";
import { Debug } from "functions/debug";
import { Builder } from "roles/Builder";
import { Harvester } from "roles/Harvester";
import { Miner } from "roles/Miner";
import { Supergrader } from "roles/Supergrader";
import { Upgrader } from "roles/Upgrader";

export class Runner {
    private static runEvery: number = 1;
    // private static softLimit: number = 2;

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
                    const a = Game.cpu.getUsed();
                    Harvester.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.colour(creep, Harvester.colour, cost);
                }
                break;
            // Miners
            case Miner.roleName:
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    Miner.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.colour(creep, Miner.colour, cost);
                }
                break;
            // Upgraders
            case Upgrader.roleName:
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    Upgrader.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.colour(creep, Upgrader.colour, cost);
                }
                break;
            // Supergraders
            case Supergrader.roleName:
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    Supergrader.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.colour(creep, Supergrader.colour, cost);
                }
                break;
            // Builders
            case Builder.roleName:
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    Builder.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.colour(creep, Builder.colour, cost);
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

    private static colour(creep: Creep, colour: string, cost: number): void {
        creep.room.visual.circle(creep.pos, {
            fill: colour,
            opacity: 0.1,
            radius: 0.4,
            stroke: colour
        }).text(cost.toFixed(2), creep.pos, {
            align: "left",
            color: colour,
            font: 0.5,
            stroke: "rgba(0,0,0,0.5)"
        });
    }
}
