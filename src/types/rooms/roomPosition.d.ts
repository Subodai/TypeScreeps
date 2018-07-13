interface RoomPosition {
    isRoomEdge(): boolean;
    getSpacesAround(creep?: Creep, ignore?: boolean): RoomPosition[];
    numSpacesAround(creep?: Creep, ignore?: boolean): number;
    isStandable(creep?: Creep, ignore?: boolean): boolean;
    hasWall(): boolean;
    hasCreep(): boolean | Creep;
}
