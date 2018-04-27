/**
 * Creep Typings
 */

interface Creep {
    checkEmptyAtPos(pos: RoomPosition): boolean;
    findSpaceAtSource(source: Source): boolean;
    isTired(): boolean;
    clearTargets(): void;
    getNearbyEnergy(useStorage?: boolean, emergency?: boolean): ScreepsReturnCode;
    deliverEnergy(): ScreepsReturnCode;
    fillLinks(): ScreepsReturnCode | false;
    fillSpawns(): ScreepsReturnCode | false;
    fillTowers(): ScreepsReturnCode | false;
    pickStorageOrTerminal(): StructureStorage | StructureTerminal | null;
    fillRoomStorageOrTerminal(): ScreepsReturnCode | false;
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
    empty(): boolean;
    roadCheck(work?: boolean): void;
    containerCheck(): void | boolean;
    repairStructures(roads?: boolean, defences?: boolean, structures?: boolean): number;
    findDamagedStructures(): void;
    state: CreepState;
    role: string;
    upgradeHomeRoom(): ScreepsReturnCode;
    atHome(): boolean;
    pickSource(): boolean;
    moveToSource(): ScreepsReturnCode;
    mineSource(): ScreepsReturnCode;
    deathCheck(ticks: number): void;
    buildNearestSite(): ScreepsReturnCode | void;
    checkSiteInMemory(): void;
    findNearestConstructionSite(my?: boolean): void;
    goToAndBuild(siteId: string): ScreepsReturnCode;
    deSpawn(): void;
    chooseRemoteRoom(): void;
    goToRoom(roomName: string): void;
    chooseHomeRoom(): void;
    travelTo(destination: RoomPosition | { pos: RoomPosition }, option?: TravelToOptions): number;
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
    _travel?: TravelData;
    repairTarget?: string;
    targetMaxHP?: number;
    dying?: boolean;
    assignedSource?: string;
    assignedMineral?: string;
    idle?: number;
    lastSpaceCheck?: number;
    siteId?: string;
    targetRoom?: string;
    reserveRoom?: string;
    flagName?: string;
    _home?: string;
    remoteRoom?: string;
}
