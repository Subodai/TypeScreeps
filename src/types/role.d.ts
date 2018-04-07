/**
 * Creep Role Definition
 */
declare class Role {
    public ticksBeforeRenew: number;
    /**
     * Name of the role
     */
    public roleName: string;
    /**
     * The amount of creeps we need per RCL level
     */
    public roster: number[];
    /**
     * The amount of creeps we need per RCL when links are enabled
     */
    public rosterLinks?: number[];
    /**
     * The body makeup of the role per RCL
     */
    public bodyStructure: BodyPartConstant[][];
    /**
     * The body makeup of the role per RCL when links are enabled
     */
    public bodyStructureLinks?: BodyPartConstant[][];
    /**
     * Is this role enabled for a given room?
     * @param room {Room}
     * @returns {boolean}
     */
    public enabled(room: Room): boolean;
    /**
     * Run the role in it's state machine
     * @param creep {Creep}
     * @returns {void}
     */
    public run(creep: Creep): void;
}

declare class Miner extends Role {}
declare class Harvester extends Role {}
declare class Upgrader extends Role {}
declare class Supergrader extends Role {}
declare class Builder extends Role {}
/**
 * Defines what a creep does during it's lifespan
 */
type CreepRole = Role | Miner | Harvester | Upgrader | Supergrader | Builder;
