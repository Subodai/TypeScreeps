/**
 * Creep Typings
 */

interface Creep {
    boosted?: boolean;
    state: CreepState;
    role: string;
    threat: number;

    atHome(): boolean;
    buildNearestSite(): ScreepsReturnCode | void;
    canDo(bodyPart: BodyPartConstant): boolean;
    canPickup(target: RoomObject, range?: number): boolean;
    canWork(): boolean;
    checkEmptyAtPos(pos: RoomPosition): boolean;
    checkSiteInMemory(): void;
    chooseClaimRoom(): void;
    chooseDeconstructionTarget(): void;
    chooseHighPriorityDefenceTarget(defences?: boolean, structures?: boolean): void;
    chooseHomeRoom(): void;
    chooseRemoteMinerRoom(): void;
    chooseRemoteRoom(): void;
    chooseRepairTarget(roads?: boolean, defences?: boolean, structures?: boolean): void;
    chooseReserveRoom(): void;
    claimRemoteRoom(): void;
    clearTargets(): void;
    containerCheck(): void | boolean;
    deathCheck(ticks: number): void;
    deconstructRoomTargets(): ScreepsReturnCode;
    deliverEnergy(): ScreepsReturnCode;
    deliverMinerals(): ScreepsReturnCode;
    deSpawn(): void;
    empty(): boolean;
    fillContainers(): ScreepsReturnCode | false;
    fillLabs(): ScreepsReturnCode | false;
    fillLinks(): ScreepsReturnCode | false;
    fillLinksAndLabs(): ScreepsReturnCode | false;
    fillNukeEnergy(): ScreepsReturnCode | false;
    fillNukeGhodium(): ScreepsReturnCode | false;
    fillRoomStorageOrTerminal(): ScreepsReturnCode | false;
    fillSpawns(): ScreepsReturnCode | false;
    fillTowers(): ScreepsReturnCode | false;
    findContainerEnergy(): Structure | null;
    findContainerMinerals(): void;
    findDamagedDefences(): void;
    findDamagedRampart(): void;
    findDamagedStructures(): void;
    findDamagedWall(): void;
    findDroppedEnergy(): Resource | null;
    findGroundMinerals(): void;
    findNearbyEnergyTarget(): void;
    findNearestConstructionSite(my?: boolean): void;
    findRampart(hp: number): void;
    findResourceOfType(type: ResourceConstant): void;
    findSpaceAtSource(source: Source): boolean;
    findStorageMinerals(): void;
    findTombstoneEnergy(): Tombstone | null;
    findTombstoneMinerals(): void;
    findWall(hp: number): void;
    full(): boolean;
    getNearbyEnergy(useStorage?: boolean, emergency?: boolean): ScreepsReturnCode;
    getNearbyMinerals(useStorage: boolean, type?: ResourceConstant): ScreepsReturnCode;
    goToAndBuild(siteId: string): ScreepsReturnCode;
    goToRoom(roomName: string): void;
    invalidateMineralTarget(full?: boolean): ScreepsReturnCode;
    isOnHold(): boolean;
    isTired(): boolean;
    log(msg: string): void;
    mineMineral(): ScreepsReturnCode;
    mineSource(): ScreepsReturnCode;
    moveEfficiency(): number;
    moveToAndPickupMinerals(): ScreepsReturnCode;
    moveToMineral(): ScreepsReturnCode;
    moveToSource(): ScreepsReturnCode;
    pickMineral(): boolean;
    pickSource(): boolean;
    pickStorageOrTerminal(): StructureStorage | StructureTerminal | null;
    repairCurrentTarget(): ScreepsReturnCode;
    repairStructures(roads?: boolean, defences?: boolean, structures?: boolean): number;
    reserveRemoteRoom(): void;
    roadCheck(work?: boolean): void;
    travelTo(destination: HasPos | RoomPosition, options?: TravelToOptions): number;
    travelTo(destination: RoomPosition | { pos: RoomPosition }, option?: TravelToOptions): number;
    upgradeHomeRoom(): ScreepsReturnCode;
    validateCurrentRepairTarget(): void;
}

interface CreepMemory {
    role: string;
    state: CreepState;
    level: number;
    sType?: string;
    roomName?: string;
    energyPickup?: string;
    mineralPickup?: string;
    mineralType?: ResourceConstant;
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
    claimRoom?: string;
    _legacyRole?: string;
    debug?: boolean;
    signed?: boolean;
    sleepUntil?: number;
    threat?: number;
    deconstructionTarget?: string;
    boosted: boolean;
}
