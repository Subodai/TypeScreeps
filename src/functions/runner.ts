import { ROLEMODELS, ROLES } from "config/constants";
import { Debug } from "functions/debug";
import { toHex } from "./tools";

export class Runner {
    private static runEvery: number = 1;
    // private static softLimit: number = 2;

    public static run(): void {
        if (Game.time % this.runEvery === 0) {
            Debug.Log("Runner Start");
            const before: number = Game.cpu.getUsed();
            const creepsCPU = this.creeps();
            this.rooms(creepsCPU);
            const after: number = Game.cpu.getUsed();
            Debug.Log("Runner Finished used " + (after - before).toFixed(3) + " CPU");
        }
    }

    private static creeps(): number {
        Debug.Log("Running Creeps");
        const cpu: number = Game.cpu.getUsed();
        for (const i in ROLES) {
            this.role(ROLES[i]);
        }
        const total = Game.cpu.getUsed() - cpu;
        Debug.Log("Creeps used " + total.toFixed(3) + " CPU");
        return total;
    }

    private static rooms(creepsCPU: number): void {
        Debug.Log("Running Rooms");
        const cpu: number = Game.cpu.getUsed();
        for (const name in Game.rooms) {
            const roomCPU = Game.cpu.getUsed();
            const room = Game.rooms[name];
            // Run the towers
            const towerCost = this.towers(room);
            // Run the links
            const linkCost = this.links(room);
            const avg = creepsCPU / Object.keys(Game.creeps).length;
            const storedEnergy = room.storage ? room.storage.store[RESOURCE_ENERGY] : 0;
            room.visual.text(
                "Room CPU : " + (Game.cpu.getUsed() - roomCPU).toFixed(2) +
                " All Creeps: " + creepsCPU.toFixed(2) + " Per Creep: " + avg.toFixed(2), 1, 1, {
                align : "left"
            }).text("Towers : " + towerCost.toFixed(2), 1, 2, {
                align: "left"
            }).text("Links : " + linkCost.toFixed(2), 1, 3, {
                align: "left"
            }).text("Energy : " + room.energyAvailable + "/" + room.energyCapacityAvailable,  1, 4, {
                align: "left", color: this.percentToColour(room.energyAvailable / room.energyCapacityAvailable)
            }).text("Stored : " + storedEnergy, 1, 5, {
                align: "left", color: this.percentToColour(storedEnergy / 1000000)
            }).text("Collectable : " + room.collectableEnergy(), 1, 6, {
                align: "left", color: "#00FFFF"});
        }
        Debug.Log("Rooms used " + (Game.cpu.getUsed() - cpu).toFixed(3) + " CPU");
    }

    private static towers(room: Room): number {
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
        room.log("Towers used " + towerCost + " CPU");
        return towerCost;
    }

    private static links(room: Room): number {
        room.log("Running Links");
        if (!room.memory.links) {
            room.log("Links disabled");
            return 0;
        }
        const links = room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_LINK &&
                           s.linkType === "receiver" &&
                           s.energy <= (s.energyCapacity * 0.25)
        });
        let linkCost = 0;
        if (links.length > 0) {
            for (const i in links) {
                // Grab the link
                const link: StructureLink = links[i] as StructureLink;
                const cost = link.runReceiver();
                this.visualiseLink(link, cost);
                linkCost += cost;
            }
        }
        room.log("Links used " + linkCost + " CPU");
        return linkCost;
    }

    private static role(role: string): boolean {
        // Grab the creeps
        const creeps = _.filter(Game.creeps, (c: Creep) => c.role === role);
        let handler: Role;
        for (handler of ROLEMODELS) {
            if (role === handler.roleName) {
                for (const creep of creeps) {
                    const a = Game.cpu.getUsed();
                    handler.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.visualise(creep, handler.colour, cost);
                }
            }
        }
        return true;
    }

    private static migrateCreepsToRole(roleName: string, creeps: Creep[]): void {
        for (const creep of creeps) {
            creep.memory._legacyRole = creep.role;
            creep.role = roleName;
            creep.clearTargets();
        }
    }

    private static visualise(item: Creep | StructureTower | StructureLink, colour: string, cost: number): void {
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

    private static visualiseLink(link: StructureLink, cost: number): void {
        const colour = this.percentToColour(link.energy / link.energyCapacity);
        this.visualise(link, colour, cost);
    }

    private static percentToColour(p: number): string {
        const r = Math.round(255 - (255 * p));
        const g = Math.round(255 * p);
        const b = 0;
        const colour = "#" + toHex(r) + toHex(g) + toHex(b);
        return colour;
    }
}
