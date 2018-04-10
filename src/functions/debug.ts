export class Debug {
    private static cGrey: string = "#e2e2e2";
    private static cRed: string = "#f45138";
    private static cGreen: string = "#aff98f";
    private static cBlue: string = "#42d7f4";
    private static cLBlue: string = "#8da6c6";
    private static cYellow: string = "#f8f990";
    private static debugEnabled: boolean = Memory.debugEnabled;
    private static creepDebugEnabled: boolean = Memory.creepDebug;
    private static roomDebugEnabled: boolean = Memory.roomDebug;
    private static memoryDebugEnabled: boolean = Memory.memoryDebug;
    private static spawnDebugEnabled: boolean = Memory.spawnDebug;
    private static towerDebugEnabled: boolean = Memory.towerDebug;
    /**
     * Debug messages for creeps, will spit out room details and creep details
     *
     * @param message {string}
     * @param creep {Creep}
     */
    public static creep(message: string, creep: Creep): void {
        if (!this.creepDebugEnabled || !this.debugEnabled) { return; }
        let msg: string = "";
        msg += "<span style='color:" + this.cGrey + ";'>[" + Game.time + "] </span>";
        const room: Room = creep.room;
        if (room) {
            msg += "<span style='color:" + this.cYellow + ";'>[" + room.name + "] </span>";
        }
        if (creep) {
            msg += "<span style='color:" + this.cGreen + ";'>[" + creep.name + "] </span>";
        }
        if (creep.state !== undefined) {
            msg += "<span style='color:" + this.cLBlue + ";'>[" + creep.state + "] </span>";
        }
        msg += message;
        console.log(msg);
    }

    /**
     * Debug messages for rooms, will spit out room details
     *
     * @param message {string}
     * @param room {Room}
     */
    public static Room(message: string, room: Room): void {
        if (!this.roomDebugEnabled || !this.debugEnabled) { return; }
        let msg: string = "";
        msg += "<span style='color:" + this.cGrey + ";'>[" + Game.time + "]</span> ";
        if (room) {
            msg += "<a href='/a/#!/room/shard1/" + room.name + "'>";
            msg += "<span style='color:" + this.cYellow + ";'>[" + room.name + "]</span>";
            msg += "</a> ";
        }
        msg += message;
        console.log(msg);
    }

    /**
     * Debug messages for spawns
     *
     * @param message {string}
     * @param spawn {StructureSpawn}
     */
    public static Spawn(message: string, spawn: StructureSpawn): void {
        if (!this.spawnDebugEnabled || !this.debugEnabled) { return; }
        let msg: string = "";
        msg += "<span style='color:" + this.cGrey + ";'>[" + Game.time + "]</span> ";
        const room: Room = spawn.room;
        if (room) {
            msg += "<span style='color:" + this.cYellow + ";'>[" + room.name + "]</span> ";
        }
        if (spawn) {
            msg += "<span style='color:" + this.cBlue + ";'>[" + spawn.name + "]</span> ";
        }
        msg += message;
        console.log(msg);
    }

    /**
     * Debug messages for towers
     *
     * @param message {string}
     * @param tower {StructureTower}
     */
    public static Tower(message: string, tower: StructureTower): void {
        if (!this.towerDebugEnabled || !this.debugEnabled) { return; }
        let msg: string = "";
        msg += "<span style='color:" + this.cGrey + ";'>[" + Game.time + "]</span> ";
        const room: Room = tower.room;
        if (room) {
            msg += "<span style='color:" + this.cYellow + ";'>[" + room.name + "]</span> ";
        }
        if (tower) {
            msg += "<span style='color:" + this.cBlue + ";'>[" + tower.id + "]</span> ";
        }
        msg += message;
        console.log(msg);
    }

    /**
     * Debug Messages with niceness
     *
     * @param message {string}
     */
    public static Log(message: string): void {
        if (!this.debugEnabled) { return; }
        let msg: string = "";
        msg += "<span style='color:" + this.cGrey + ";'>[" + Game.time + "]</span> ";
        msg += message;
        console.log(msg);
    }

    /**
     * Debug Messages for Memory with niceness
     *
     * @param message {string}
     */
    public static Memory(message: string): void {
        if (!this.memoryDebugEnabled || !this.debugEnabled) { return; }
        let msg: string = "";
        msg += "<span style='color:" + this.cRed + ";'>[Memory]</span> ";
        msg += message;
        console.log(msg);
    }

    /**
     * Debug Messages for Module Loads
     * @param message {string}
     */
    public static Load(message: string): void {
        // always debug loads
        let msg: string = "";
        msg += "<span style='color:" + this.cYellow + ";'>[Load]</span> ";
        msg += message;
        console.log(msg);
    }
}

export function debugEnablers(): void {
    Debug.Load("Global Debug functions enabled");
    global.ToggleDebug = function ToggleDebug(): string {
        if (!Memory.debugEnabled) {
            Memory.debugEnabled = true;
            return "Debug Enabled";
        } else {
            Memory.debugEnabled = false;
            return "Debug Disabled";
        }
    };

    global.ToggleCreepDebug = function ToggleCreepDebug(): string {
        if (!Memory.creepDebug) {
            Memory.creepDebug = true;
            return "Creep Debug Enabled";
        } else {
            Memory.creepDebug = false;
            return "Creep Debug Disabled";
        }
    };

    global.ToggleRoomDebug = function ToggleRoomDebug(): string {
        if (!Memory.roomDebug) {
            Memory.roomDebug = true;
            return "Room Debug Enabled";
        } else {
            Memory.roomDebug = false;
            return "Room Debug Disabled";
        }
    };

    global.ToggleMemoryDebug = function ToggleMemorydebug(): string {
        if (!Memory.memoryDebug) {
            Memory.memoryDebug = true;
            return "Memory Debug Enabled";
        } else {
            Memory.memoryDebug = false;
            return "Memory Debug Disabled";
        }
    };

    global.ToggleSpawnDebug = function ToggleSpawnDebug(): string {
        if (!Memory.spawnDebug) {
            Memory.spawnDebug = true;
            return "Spawn Debug Enabled";
        } else {
            Memory.spawnDebug = false;
            return "Spawn Debug Disabled";
        }
    };

    global.ToggleTowerDebug = function ToggleTowerDebug(): string {
        if (!Memory.towerDebug) {
            Memory.towerDebug = true;
            return "Tower Debug Enabled";
        } else {
            Memory.towerDebug = false;
            return "Tower Debug Disabled";
        }
    };
}
