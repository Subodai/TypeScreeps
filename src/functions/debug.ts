export class Debug {
    public static cGrey: string = "#e2e2e2";
    public static cRed: string = "#f45138";
    public static cGreen: string = "#aff98f";
    public static cBlue: string = "#42d7f4";
    public static cLBlue: string = "#8da6c6";
    public static cYellow: string = "#f8f990";
    public static cPurple: string = "#5900ff";
    private static debugEnabled: boolean = Memory.debugEnabled;
    private static creepDebugEnabled: boolean = Memory.creepDebug;
    private static roomDebugEnabled: boolean = Memory.roomDebug;
    private static memoryDebugEnabled: boolean = Memory.memoryDebug;
    private static spawnDebugEnabled: boolean = Memory.spawnDebug;
    private static towerDebugEnabled: boolean = Memory.towerDebug;
    private static linkDebugEnabled: boolean = Memory.linkDebug;
    private static labDebugEnabled: boolean = Memory.labDebug;

    /**
     * Debug messages for creeps, will spit out room details and creep details
     *
     * @param message {string}
     * @param creep {Creep}
     */
    public static creep(message: string, creep: Creep): void {
        if (!creep.memory.debug) {
            if (!this.creepDebugEnabled || !this.debugEnabled) {
                return;
            }
        }
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
        if (!room.memory.debug) {
            if (!this.roomDebugEnabled || !this.debugEnabled) {
                return;
            }
        }
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
        if (!spawn.memory.debug) {
            if (!this.spawnDebugEnabled || !this.debugEnabled) {
                return;
            }
        }
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
        if (!tower.memory.debug) {
            if (!this.towerDebugEnabled || !this.debugEnabled) {
                return;
            }
        }

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
     * Debug messages for links
     *
     * @param message {string}
     * @param tower {StructureTower}
     */
    public static Link(message: string, link: StructureLink): void {
        if (!link.memory.debug) {
            if (!this.linkDebugEnabled || !this.debugEnabled) {
                return;
             }
        }
        let msg: string = "";
        msg += "<span style='color:" + this.cGrey + ";'>[" + Game.time + "]</span> ";
        const room: Room = link.room;
        if (room) {
            msg += "<span style='color:" + this.cYellow + ";'>[" + room.name + "]</span> ";
        }
        if (link) {
            msg += "<span style='color:" + this.cBlue + ";'>[" + link.id + "]</span> ";
        }
        msg += message;
        console.log(msg);
    }

    /**
     * Debug messages for labs
     *
     * @param message {string}
     * @param tower {StructureTower}
     */
    public static Lab(message: string, lab: StructureLab): void {
        if (!lab.memory.debug) {
            if (!this.labDebugEnabled || !this.debugEnabled) {
                return;
            }
        }
        let msg: string = "";
        msg += "<span style='color:" + this.cGrey + ";'>[" + Game.time + "]</span> ";
        const room: Room = lab.room;
        if (room) {
            msg += "<span style='color:" + this.cYellow + ";'>[" + room.name + "]</span> ";
        }
        if (lab) {
            msg += "<span style='color:" + this.cPurple + ";'>[" + lab.id + "]</span> ";
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
        this.LogAlways(message);
    }

    /**
     * Always writes to the log
     * @param message {string}
     */
    public static LogAlways(message: string): void {
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

    global.ToggleCreepDebug = (): string => {
        if (!Memory.creepDebug) {
            Memory.creepDebug = true;
            return "Creep Debug Enabled";
        } else {
            Memory.creepDebug = false;
            return "Creep Debug Disabled";
        }
    };

    global.ToggleRoomDebug = (): string => {
        if (!Memory.roomDebug) {
            Memory.roomDebug = true;
            return "Room Debug Enabled";
        } else {
            Memory.roomDebug = false;
            return "Room Debug Disabled";
        }
    };

    global.ToggleMemoryDebug = (): string => {
        if (!Memory.memoryDebug) {
            Memory.memoryDebug = true;
            return "Memory Debug Enabled";
        } else {
            Memory.memoryDebug = false;
            return "Memory Debug Disabled";
        }
    };

    global.ToggleSpawnDebug = (): string => {
        if (!Memory.spawnDebug) {
            Memory.spawnDebug = true;
            return "Spawn Debug Enabled";
        } else {
            Memory.spawnDebug = false;
            return "Spawn Debug Disabled";
        }
    };

    global.ToggleTowerDebug = (): string => {
        if (!Memory.towerDebug) {
            Memory.towerDebug = true;
            return "Tower Debug Enabled";
        } else {
            Memory.towerDebug = false;
            return "Tower Debug Disabled";
        }
    };
}
