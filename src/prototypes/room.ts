export function loadRoomPrototypes(): void {
    console.log("Loading Room prototypes");
    Room.prototype.clearSites = function() {
        const sites = this.find(FIND_CONSTRUCTION_SITES);
        for (const s in sites) {
            sites[s].remove();
        }
        return OK;
    };
}
