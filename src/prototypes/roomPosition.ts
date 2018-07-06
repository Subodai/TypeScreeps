import { Debug } from "functions/debug";

/**
 * Is this roomposition at at room edge?
 * @returns {boolean}
 */
RoomPosition.prototype.isRoomEdge = function(): boolean {
    if (this.x === 0 || this.x === 49) { return true; }
    if (this.y === 0 || this.y === 49) { return true; }
    return false;
};

RoomPosition.prototype.getSpacesAround = function(creep?: Creep): RoomPosition[] {
    const positions: RoomPosition[] = [];
    const  n = new RoomPosition(this.x, (this.y - 1), this.roomName);
    const ne = new RoomPosition((this.x + 1), (this.y - 1), this.roomName);
    const  e = new RoomPosition((this.x + 1), this.y, this.roomName);
    const se = new RoomPosition((this.x + 1), (this.y + 1), this.roomName);
    const  s = new RoomPosition(this.x, (this.y + 1), this.roomName);
    const sw = new RoomPosition((this.x - 1), (this.y + 1), this.roomName);
    const  w = new RoomPosition((this.x - 1), this.y, this.roomName);
    const nw = new RoomPosition((this.x - 1), (this.y - 1), this.roomName);
    if (n.isStandable(creep)) {  positions.push(n); }
    if (ne.isStandable(creep)) { positions.push(ne); }
    if (e.isStandable(creep)) {  positions.push(e); }
    if (se.isStandable(creep)) { positions.push(se); }
    if (s.isStandable(creep)) {  positions.push(s); }
    if (sw.isStandable(creep)) { positions.push(sw); }
    if (w.isStandable(creep)) {  positions.push(w); }
    if (nw.isStandable(creep)) { positions.push(nw); }
    return positions;
};

RoomPosition.prototype.numSpacesAround = function(creep?: Creep): number {
    return Object.keys(this.getSpacesAround()).length;
};

RoomPosition.prototype.isStandable = function(creep?: Creep): boolean {
    // if it has a wall, then false
    if (this.hasWall()) {
        console.log("found wall");
        return false;
    }
    const space = this.hasCreep();
    // if the space has no creep, true
    if (false === space) {
        console.log("no creep");
        return true;
    }
    // if the space is our creep, return true (we're already there)
    if ((creep !== undefined) && creep === space) {
        console.log("current creep");
        return true;
    }
    console.log("creep found");
    // no space
    return false;
};

RoomPosition.prototype.hasWall = function(): boolean {
    const terrain: Terrain = Game.map.getTerrainAt(this);
    if (terrain === "wall") {
        // log wall found
        return true;
    }
    const structures: Structure[] = this.lookFor(LOOK_STRUCTURES);
    if (structures.length > 0) {
        for (const s of structures) {
            if (s.structureType === STRUCTURE_WALL) {
                return true;
            }
        }
    }
    return false;
};

RoomPosition.prototype.hasCreep = function(): boolean | Creep {
    const creeps: Creep[] = this.lookFor(LOOK_CREEPS);
    if (creeps.length === 0) {
        return false;
    }
    return creeps[0] as Creep;
};
