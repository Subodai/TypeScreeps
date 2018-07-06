interface RoomPosition {
    isRoomEdge(): boolean;
    getSpacesAround(creep?: Creep): RoomPosition[];
    numSpacesAround(): number;
    isStandable(creep?: Creep): boolean;
    hasWall(): boolean;
    hasCreep(): boolean | Creep;
}
