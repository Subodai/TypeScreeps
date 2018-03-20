export function loadCreepPrototypes(): void {
    console.log("Loading Creep Prototype");
    Creep.prototype.isTired = function(): boolean {
        return this.spawning || this.fatigue > 0;
    };
}
