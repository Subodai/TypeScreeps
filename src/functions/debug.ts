export class Debug {

    private static c_grey: string = '#CCCCCC';
    private static c_red: string = '#FF0000';
    private static c_green: string = '#00FF00';
    private static c_blue: string = '#0000FF';
    private static c_yellow: string = '#FFFF00';

    /**
     * Debug messages for creeps, will spit out room details and creep details
     *
     * @param message {string}
     * @param creep {Creep}
     */
    public static CreepMsg(message: string, creep: Creep) {
        let msg: string = '';
        msg += '<span style="color:' + this.c_grey + ';">[' + Game.time + ']</span> ';
        let room: Room = creep.room;
        if (room) {
            msg += '<span style="color:' + this.c_yellow + ';">[' + room.name + ']</span> ';
        }
        if (creep) {
            msg += '<span style="color:' + this.c_green + ';">[' + creep.name + ']</span> ';
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
    public static RoomMsg(message: string, room: Room) {
        let msg: string = '';
        msg += '<span style="color:' + this.c_grey + ';">[' + Game.time + ']</span> ';
        if (room) {
            msg += '<a href="/a/#!/room/shard1/' + room.name + '"><span style="color:' + this.c_yellow + ';">[' + room.name + ']</span></a> ';
        }
        msg += message;
        console.log(msg);
    }

    /**
     * Debug Messages with niceness
     *
     * @param message {string}
     */
    public static DebugMsg(message: string) {
        let msg: string = '';
        msg += '<span style="color:' + this.c_grey + ';">[' + Game.time + ']</span> ';
        msg += message;
        console.log(msg);
    }
}

