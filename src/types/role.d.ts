/**
 * Creep Role Definition
 */
declare class Role {
    /**
     * Name of the role
     */
    roleName: string;
    /**
     * The amount of creeps we need per RCL level
     */
    roster: number[];
    /**
     * The amount of creeps we need per RCL when links are enabled
     */
    rosterLinks?: number[];
    /**
     * The body makeup of the role per RCL
     */
    bodyStructure: BodyPartConstant[][];
    /**
     * The body makeup of the role per RCL when links are enabled
     */
    bodyStructureLinks?: BodyPartConstant[][];
    /**
     * Is this role enabled for a given room?
     * @param room {Room}
     * @returns {boolean}
     */
    enabled(room: Room): boolean;
    /**
     * Run the role in it's state machine
     * @param creep {Creep}
     * @returns {void}
     */
    run(creep: Creep): void;
}

/**
 * Miner Class
 * @description Is assigned a source in a room, and will mine it to the floor or
 * container that is is standing on
 */
declare class Miner extends Role {
    /**
     * Pick a source in a room for the miner
     * @param creep {Creep}
     * @returns {boolean}
     */
    private static pickSource(creep: Creep): boolean;
    /**
     * Move to the source we have stored in memory
     * @param creep {Creep}
     * @returns {ScreepsReturnCode}
     */
    private static moveToSource(creep: Creep): ScreepsReturnCode;
    /**
     * Mine the source we have stored in memory
     * @param creep {Creep}
     * @returns {ScreepsReturnCode}
     */
    private static mineSource(creep: Creep): ScreepsReturnCode;
}

/**
 * Harvester Class
 * @description Energy Gatherer
 */
declare class Harvester extends Role { }

/**
 * Defines what a creep does during it's lifespan
 */
type CreepRole = Miner | Harvester;
