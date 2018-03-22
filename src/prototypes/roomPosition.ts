import { Debug } from "functions/debug";

export function loadRoomPositionPrototypes(): void {
    // Debug
    Debug.Log("Loading RoomPosition Prototype");

    /**
     * Is this roomposition at at room edge?
     * @returns {boolean}
     */
    RoomPosition.prototype.isRoomEdge = function(): boolean {
        if (this.x === 0 || this.x === 49) { return true; }
        if (this.y === 0 || this.y === 49) { return true; }
        return false;
    };
}
