import { Debug } from "./debug";

export class Cleaner {
    private static runEvery: number = 10;

    public static run(): void {
        if (Game.time % this.runEvery === 0) {
            Debug.Memory("Cleaning");
            const cpu: number = Game.cpu.getUsed();
            this.creeps();
            this.rooms();
            Debug.Memory("Cleaner used " + (Game.cpu.getUsed() - cpu).toFixed(3) + " CPU");
        }
    }

    /**
     * Clean Creep Memory
     */
    private static creeps(): void {
        Debug.Memory("Cleaning Creeps");
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                Debug.Memory("Cleaning [" + name + "]");
                delete Memory.creeps[name];
            }
        }
    }

    /**
     * Clean room memory
     */
    private static rooms(): void {
        Debug.Memory("Cleaning rooms");
        for (const room in Memory.rooms) {
            if (!(room in Game.rooms) && !Memory.rooms[room].avoid && !Memory.rooms[room].keep) {
                Debug.Memory("Cleaning [" + room + "]");
                delete Memory.rooms[room];
            }
        }
    }
}
