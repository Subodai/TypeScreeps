import { ROLES } from "config/constants";
import { Debug } from "functions/debug";
import { Builder } from "roles/Builder";
import { Harvester } from "roles/Harvester";
import { Miner } from "roles/Miner";
import { Refiller } from "roles/Refiller";
import { Supergrader } from "roles/Supergrader";
import { Upgrader } from "roles/Upgrader";
import { toHex } from "./tools";

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
        const cpu: number = Game.cpu.getUsed();
        for (const i in ROLES) {
            this.role(ROLES[i]);
        }
        Debug.Log("Creeps used " + (Game.cpu.getUsed() - cpu).toFixed(3) + " CPU");
    }

    private static rooms(): void {
        Debug.Log("Running Rooms");
        const cpu: number = Game.cpu.getUsed();
        for (const name in Game.rooms) {
            const roomCPU = Game.cpu.getUsed();
            const room = Game.rooms[name];
            room.log("Running Towers");
            const towers = room.find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_TOWER && s.energy > 0
            });
            let towerCost = 0;
            if (towers.length > 0) {
                for (const i in towers) {
                    const tower: StructureTower = towers[i] as StructureTower;
                    const cost = tower.run();
                    this.visualiseTower(tower, cost);
                    towerCost += cost;
                }
            }
            room.log("Towers used " + towerCost + "CPU");

            const storedEnergy = room.storage ? room.storage.store[RESOURCE_ENERGY] : 0;
            room.visual.text("CPU : " + (Game.cpu.getUsed() - roomCPU), 1, 1, {
                align : "left"
            }).text("Towers : " + towerCost, 1, 2, {
                align: "left"
            }).text("Energy : " + room.energyAvailable + "/" + room.energyCapacityAvailable,  1, 3, {
                align: "left", color: this.percentToColour(room.energyAvailable / room.energyCapacityAvailable)
            }).text("Stored : " + storedEnergy, 1, 4, {
                align: "left", color: this.percentToColour(storedEnergy / 1000000)
            });
        }
        Debug.Log("Rooms used " + (Game.cpu.getUsed() - cpu).toFixed(3) + " CPU");
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
                    this.visualise(creep, Harvester.colour, cost);
                }
                break;
            // Miners
            case Miner.roleName:
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    Miner.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.visualise(creep, Miner.colour, cost);
                }
                break;
            // Upgraders
            case Upgrader.roleName:
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    Upgrader.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.visualise(creep, Upgrader.colour, cost);
                }
                break;
            // Supergraders
            case Supergrader.roleName:
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    Supergrader.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.visualise(creep, Supergrader.colour, cost);
                }
                break;
            // Builders
            case Builder.roleName:
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    Builder.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.visualise(creep, Builder.colour, cost);
                }
                break;
            // Refillers
            case Refiller.roleName:
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    Refiller.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.visualise(creep, Refiller.colour, cost);
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

    private static visualise(item: Creep | StructureTower, colour: string, cost: number): void {
        item.room.visual.circle(item.pos, {
            fill: colour,
            opacity: 0.1,
            radius: 0.4,
            stroke: colour
        }).text(cost.toFixed(2), item.pos, {
            align: "center",
            color: colour,
            font: 0.5,
            stroke: "rgba(0,0,0,0.5)"
        });
    }

    private static visualiseTower(tower: StructureTower, cost: number): void {
        const colour = this.percentToColour(tower.energy / tower.energyCapacity);
        this.visualise(tower, colour, cost);
    }

    private static percentToColour(p: number): string {
        const r = Math.round(255 - (255 * p));
        const g = Math.round(255 * p);
        const b = 0;
        const colour = "#" + toHex(r) + toHex(g) + toHex(b);
        return colour;
    }
}
