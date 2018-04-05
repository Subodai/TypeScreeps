/**
 * Room Typings
 */
interface Room {
    /**
     * Initialise a room's memory object
     */
    init(): void;
    /**
     * Clear all the buildsites in a room
     */
    clearSites(): number;
    /**
     * Count and return the collectable energy in a room
     */
    collectableEnergy(): number;
    /**
     * Count and return the number of hostiles in a room
     */
    hostiles(): number;
    /**
     * Initiate a drain of the storage energy into GCL
     */
    drain(): void;
    /**
     * Cancel draining of storage energy into GCL
     */
    stopDrain(): void;
    /**
     * Log a message via Debug.Room
     */
    log(msg: string): void;
    /**
     * Process the build flags in a room
     */
    processBuildFlags(): number;
    /**
     * Feed energy to the current feed Target
     */
    feedEnergy(): void;
    /**
     * Count and assign the energy sources in a room
     */
    sourceSetup(): void;
    /**
     * Count and assign the mineral sources in a room
     */
    mineralSetup(): void;
    /**
     * Setup the roles in a room
     */
    roleSetup(): void;
}

interface RoomMemory {
    links?: boolean;
    prioritise?: string;
    avoid?: number;
    sources?: any;
    storeMinerals?: boolean;
    war?: boolean;
    lastEnergyCheck?: number;
    energy?: number;
    lastHostileCheck?: number;
    hostiles?: number;
    charging?: boolean;
    keep?: boolean;
    emergency?: boolean;
    mode?: string;
    roles?: any;
    minersNeeded?: number;
    mineralsNeeded?: number;
    assignedSources?: { [key: string]: string | null };
    assignedMinerals?: { [key: string]: string | null };
}
