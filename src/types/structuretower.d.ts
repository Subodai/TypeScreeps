/**
 * Tower Interface
 */
interface StructureTower {

    /**
     * Log a string to console for debugging
     * @param msg The string you want to log
     * @returns void
     */
    log(msg: string): void;

    /**
     * Runs a tower and returns it's CPU use
     */
    run(): number;

    /**
     * Take the current used CPU and subtracts start from it
     * to give a used amount of cpu
     * @param start The CPU you want to subtract
     * @returns The number of CPU used
     */
    countCPU(start: number): number;

    healCreeps(): boolean;

    repairRamparts(percentage: number): boolean;

    repairWalls(percentage: number): boolean;

    repairStructures(percentage: number): boolean;

    repairRoads(): boolean;

    attackEnemies(): boolean;
}
