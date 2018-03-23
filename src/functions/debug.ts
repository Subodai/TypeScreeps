export class Debug {
    private static cGrey: string = "#CCCCCC";
    private static cRed: string = "#FF0000";
    private static cGreen: string = "#00FF00";
    private static cBlue: string = "#0000FF";
    private static cYellow: string = "#FFFF00";
    private static debugEnabled: boolean = Memory.debugEnabled;
    private static creepDebugEnabled: boolean = Memory.creepDebug;
    private static roomDebugEnabled: boolean = Memory.roomDebug;
    /**
     * Debug messages for creeps, will spit out room details and creep details
     *
     * @param message {string}
     * @param creep {Creep}
     */
    public static creep(message: string, creep: Creep): void {
        if (!this.creepDebugEnabled || !this.debugEnabled) { return; }
        let msg: string = "";
        msg += "<span style='color:" + this.cGrey + ";'>[" + Game.time + "]</span> ";
        const room: Room = creep.room;
        if (room) {
            msg += "<span style='color:" + this.cYellow + ";'>[" + room.name + "]</span> ";
        }
        if (creep) {
            msg += "<span style='color:" + this.cGreen + ";'>[" + creep.name + "]</span> ";
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
        if (!this.debugEnabled) { return; }
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
