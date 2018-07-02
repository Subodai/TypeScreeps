import { Economy } from "./Economy";
import { Resources } from "./Resources";

export class Screepsplus {
    /**
     * Collect Stats
     */
    public static CollectStats(): void {
        this.SetupMemory();
        if (Game.time % 2 === 0) {
            this.SummarizeEconomy();
        }
        this.SummarizeRooms();
    }

    /**
     * Sets up initial memory
     */
    private static SetupMemory(): void {
        if (_.isUndefined(Memory.stats)) {
            Memory.stats = {
                tick: Game.time
            };
        }
        if (global.born) {
            Memory.stats.age = Game.time - global.born;
        } else {
            Memory.stats.age = 0;
        }
        Memory.stats.cpu = Game.cpu;
        Memory.stats.gcl = Game.gcl;
        Memory.stats.memory = {
            used: RawMemory.get().length
        };
        Memory.stats.market = {
            credits: Game.market.credits,
            num_orders: Game.market.orders ? Object.keys(Game.market.orders).length : 0
        };
        if (Memory.queue) {
            Memory.stats.queue = Memory.queue;
            Memory.stats.queue.length = Memory.queue.creeps.length;
        }
    }

    /**
     * SummarizeRooms
     */
    private static SummarizeRooms(): void {
        Memory.stats.roomSummary = Resources.getRooms();
        Memory.stats.empireMinerals = global.minerals;
    }

    /**
     * SummarizeEconomy
     */
    private static SummarizeEconomy(): void {
        Memory.stats.economy = Economy.get();
    }
}
