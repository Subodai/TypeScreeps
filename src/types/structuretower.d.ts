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

    /**
     * Attack any creeps not in ALLIES, will notify user if not an Invader
     */
    attackEnemies(): boolean;

    /**
     * Heal my own injured creeps in the room
     */
    healMyCreeps(): boolean;

    /**
     * Heal Creeps who's owners are in ALLIES
     */
    healFriendlyCreeps(): boolean;

    repairRamparts(percentage: number): boolean;

    repairWalls(percentage: number): boolean;

    repairStructures(percentage: number): boolean;

    repairRoads(): boolean;


}
