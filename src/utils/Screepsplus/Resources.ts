export class Resources {
    public static getRooms(): object {
        const now = Game.time;
        if (global.resourcesTimeStamp === now) {
            return global.resources;
        }

        const retval: { [k: string]: any } = {};
        const minerals: { [k: string]: number } = {};

        for (const name in Game.rooms) {
            const room = Game.rooms[name];
            let summary = null;
            if (null === room) {
                summary = null;
            }

            // if this is a remote room
            if (!room.controller || !room.controller.my) {
                summary = this.SummarizeRemoteRoom(room);
                retval[name + "_remote"] = summary;
            } else {
                summary = this.SummarizeMyRoom(room);
                retval[name] = summary;
                if (room.storage) {
                    for (const i in room.storage.store) {
                        if (minerals[i] === undefined) {
                            minerals[i] = 0;
                        }
                        minerals[i] += room.storage.store[i];
                    }
                }

                if (room.terminal) {
                    for (const i in room.terminal.store) {
                        if (minerals[i] === undefined) {
                            minerals[i] = 0;
                        }
                        minerals[i] += room.terminal.store[i];
                    }
                }
            }
        }
        global.resourcesTimeStamp = now;
        global.roomSummary = retval;
        global.minerals = minerals;
        return retval;
    }

    private static SummarizeRemoteRoom(room: Room): object {
        return {};
    }

    private static SummarizeMyRoom(room: Room): object {
        return {};
    }
}
