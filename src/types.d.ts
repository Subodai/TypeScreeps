// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

declare let global: any;
// add your custom typings here
interface Creep {
    checkEmptyAtPos(pos: RoomPosition): boolean;
    findSpaceAtSource(source: Source): boolean;
    isTired(): boolean;
    clearTargets(): void;
    getNearbyEnergy(): number;
    getNearbyMinerals(storage: boolean): number;
    canWork(): boolean;
    canDo(bodyPart: BodyPartConstant): boolean;
    log(msg: string): void;
    travelTo(destination: HasPos | RoomPosition, options?: TravelToOptions): number;
    invalidateMineralTarget(full?: boolean): number;
    findStorageMinerals(): void;
    findGroundMinerals(): void;
    moveEfficiency(): number;
    findContainerMinerals(): void;
    moveToAndPickupMinerals(): number;
    canPickup(target: RoomObject, range?: number): boolean;
    full(): boolean;
    roadCheck(work?: boolean): void;
    containerCheck(): void | boolean;
    repairStructures(roads?: boolean, defences?: boolean, structures?: boolean): number;
    findDamagedStructures(): void;
    state: string;
    role: string;
}

interface CreepMemory {
    role: string;
    state: CreepState;
    level: number;
    sType?: string;
    roomName?: string;
    energyPickup?: string;
    mineralPickup?: string;
    canWork?: string;
    repair?: boolean;
    _trav?: TravelData;
    repairTarget?: string;
    targetMaxHP?: number;
    dying?: boolean;
    assignedSource?: string;
    assignedMineral?: string;
}

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
    assignedSources?: string[];
    assignedMinerals?: string[];
}

interface RoomPosition {
    isRoomEdge(): boolean;
}

interface OwnedStructure {
    memory?: any;
}

interface StructureSpawn {
    log(msg: string): void;
}

interface Source {
    memory?: any;
}

interface Role {
    roleName: string;
    roster: number[];
    rosterLinks?: number[];
    bodyStructure: BodyPartConstant[][];
    bodyStructureLinks?: BodyPartConstant[][];
    enabled(room: Room): boolean;
    run(creep: Creep): void;
}

interface Miner extends Role {}

type CreepRole = Miner;

// Consts
declare const STATE_SPAWN: "spawn";
declare const STATE_INIT: "init";
declare const STATE_MOVE: "move";

// Types
type STATE_SPAWN = "spawn";
type STATE_INIT = "init";
type STATE_MOVE = "move";

// Group type
type CreepState =
    STATE_SPAWN |
    STATE_INIT |
    STATE_MOVE;

/// <reference types="typed-screeps" />
/**
 * To start using Traveler, require it in main.js:
 * Example: var Traveler = require('Traveler.js');
 */
declare class Traveler {
    private static structureMatrixCache;
    private static creepMatrixCache;
    private static roomTypeCache;
    private static creepMatrixTick;
    private static structureMatrixTick;
    /**
     * move creep to destination
     * @param creep
     * @param destination
     * @param options
     * @returns {number}
     */
    static travelTo(creep: Creep, destination: HasPos | RoomPosition, options?: TravelToOptions): number;
    /**
     * make position objects consistent so that either can be used as an argument
     * @param destination
     * @returns {any}
     */
    static normalizePos(destination: HasPos | RoomPosition): RoomPosition;
    /**
     * check if room should be avoided by findRoute algorithm
     * @param roomName
     * @returns {RoomMemory|number}
     */
    static checkAvoid(roomName: string): number;
    /**
     * check if a position is an exit
     * @param pos
     * @returns {boolean}
     */
    static isExit(pos: Coord | RoomPosition): boolean;
    static isValid(pos: Coord | RoomPosition): boolean;
    /**
     * check two coordinates match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
    static sameCoord(pos1: Coord, pos2: Coord): boolean;
    /**
     * check if two positions match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
    static samePos(pos1: RoomPosition, pos2: RoomPosition): boolean;
    /**
     * draw a circle at position
     * @param pos
     * @param color
     * @param opacity
     */
    static circle(pos: RoomPosition, color: string, opacity?: number): void;
    /**
     * update memory on whether a room should be avoided based on controller owner
     * @param room
     */
    static updateRoomStatus(room: Room): void;
    /**
     * find a path from origin to destination
     * @param origin
     * @param destination
     * @param options
     * @returns {PathFinderPath}
     */
    static findTravelPath(origin: RoomPosition | HasPos, destination: RoomPosition | HasPos, options?: TravelToOptions): PathFinderPath;
    static findPathDistance(origin: RoomPosition | HasPos, destination: RoomPosition | HasPos, options?: TravelToOptions): number;
    /**
     * find a viable sequence of rooms that can be used to narrow down pathfinder's search algorithm
     * @param origin
     * @param destination
     * @param options
     * @returns {{}}
     */
    static findRoute(origin: string, destination: string, options?: TravelToOptions): {
        [roomName: string]: boolean;
    } | void;
    static findRouteDistance(roomName: string, otherRoomName: string, options?: TravelToOptions): number;
    /**
     * check how many rooms were included in a route returned by findRoute
     * @param origin
     * @param destination
     * @returns {number}
     */
    static routeDistance(origin: string, destination: string): number | void;
    /**
     * build a cost matrix based on structures in the room. Will be cached for more than one tick. Requires vision.
     * @param room
     * @param freshMatrix
     * @returns {any}
     */
    static getStructureMatrix(roomName: string, freshMatrix?: boolean): CostMatrix;
    /**
     * build a cost matrix based on creeps and structures in the room. Will be cached for one tick. Requires vision.
     * @param room
     * @returns {any}
     */
    static getCreepMatrix(room: Room): CostMatrix;
    /**
     * add structures to matrix so that impassible structures can be avoided and roads given a lower cost
     * @param room
     * @param matrix
     * @param roadCost
     * @returns {CostMatrix}
     */
    static addStructuresToMatrix(room: Room, matrix: CostMatrix, roadCost: number): CostMatrix;
    /**
     * add creeps to matrix so that they will be avoided by other creeps
     * @param room
     * @param matrix
     * @returns {CostMatrix}
     */
    static addCreepsToMatrix(room: Room, matrix: CostMatrix): CostMatrix;
    /**
     * serialize a path, traveler style. Returns a string of directions.
     * @param startPos
     * @param path
     * @param color
     * @returns {string}
     */
    static serializePath(startPos: RoomPosition, path: RoomPosition[], color?: string): string;
    /**
     * returns a position at a direction relative to origin
     * @param origin
     * @param direction
     * @returns {RoomPosition}
     */
    static positionAtDirection(origin: RoomPosition, direction: number): RoomPosition;
    static nextDirectionInPath(creep: Creep): number;
    static nextPositionInPath(creep: Creep): RoomPosition;
    private static pushCreep(creep, insist);
    /**
     * convert room avoidance memory from the old pattern to the one currently used
     * @param cleanup
     */
    static patchMemory(cleanup?: boolean): void;
    private static deserializeState(travelData, destination);
    private static serializeState(creep, destination, state, travelData);
    private static isStuck(creep, state);
    /**
     * Return missionRoom coordinates for a given Room, authored by tedivm
     * @param roomName
     * @returns {{x: (string|any), y: (string|any), x_dir: (string|any), y_dir: (string|any)}}
     */
    static getRoomCoordinates(roomName: string): RoomCoord;
    static roomType(roomName: string): number;
}

interface TravelToReturnData {
    nextPos?: RoomPosition;
    pathfinderReturn?: PathFinderPath;
    state?: TravelState;
    path?: string;
}

interface TravelToOptions {
    ignoreRoads?: boolean;
    ignoreCreeps?: boolean;
    ignoreStructures?: boolean;
    preferHighway?: boolean;
    highwayBias?: number;
    allowHostile?: boolean;
    allowSK?: boolean;
    range?: number;
    obstacles?: {
        pos: RoomPosition;
    }[];
    roomCallback?: (roomName: string, matrix: CostMatrix) => CostMatrix | boolean;
    routeCallback?: (roomName: string) => number;
    returnData?: TravelToReturnData;
    restrictDistance?: number;
    useFindRoute?: boolean;
    maxOps?: number;
    movingTarget?: boolean;
    freshMatrix?: boolean;
    offRoad?: boolean;
    stuckValue?: number;
    maxRooms?: number;
    repath?: number;
    route?: {
        [roomName: string]: boolean;
    };
    ensurePath?: boolean;
    pushy?: boolean;
}

interface TravelData {
    state: any[];
    path: string;
    delay: number;
}

interface TravelState {
    stuckCount: number;
    lastCoord: Coord;
    destination: RoomPosition;
    cpu: number;
}

interface RoomCoord {
    x: number;
    y: number;
    xDir: string;
    yDir: string;
}

declare type Coord = {
    x: number;
    y: number;
};

declare type HasPos = {
    pos: RoomPosition;
};
