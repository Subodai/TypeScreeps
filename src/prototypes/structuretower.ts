import { Debug } from "functions/debug";

export function loadTowerPrototypes(): void {
    Debug.Load("Prototype: StructureTower");

    StructureTower.prototype.log = function(msg: string): void {
        Debug.Tower(msg, this);
    };

    StructureTower.prototype.run = function(): number {
        const start = Game.cpu.getUsed();
        if (this.energy < 10) {
            return this.countCPU(start);
        }
        // always return the CPU used
        return this.countCPU(start);
    };

    // tslint:disable-next-line:only-arrow-functions
    StructureTower.prototype.countCPU = function(start: number): number {
        return Game.cpu.getUsed() - start;
    };
}
