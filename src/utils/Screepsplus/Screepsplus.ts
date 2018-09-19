import { Debug } from "functions/debug";
import { Economy } from "./Economy";
import { Resources } from "./Resources";

/**
 * Screepsplus data collector
 */
export class Screepsplus {
    /**
     * Run Every n ticks
     */
    private static runEvery: number = 5;

    /**
     * Run the Screepsplus data collector
     */
    public static run(): string {
        this.SetupMemory();
        if (global.statsEnabled && Game.time % this.runEvery === 0) {
            Debug.Log("Stats Start");
            const cpu: number = Game.cpu.getUsed();
            this.CollectStats();
            Debug.Log("Stats Finished used " + (Game.cpu.getUsed() - cpu).toFixed(3) + " CPU");
        }
        return this.HeapStats() + this.CPUStats();
    }

    /**
     * Collect Stats
     */
    private static CollectStats(): void {
        if (Game.time % 100 === 0) {
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
        if (Memory.empire) {
            if (!Memory.stats.empire) {
                Memory.stats.empire = {};
            }
            Memory.stats.empire.requests = Memory.empire.requestQueue.length;
            Memory.stats.empire.completed = Memory.empire.completedRequests.length;
        }
    }

    /**
     * SummarizeRooms
     */
    private static SummarizeRooms(): void {
        Memory.stats.roomSummary = Resources.get();
        Memory.stats.empireMinerals = global.minerals;
    }

    /**
     * SummarizeEconomy
     */
    private static SummarizeEconomy(): void {
        Memory.stats.economy = Economy.get();
    }

    /**
     * Write our CPU usage to memory, and return the used amount
     */
    private static CPUStats(): string {
        return " :CPU: Tick[" + Game.cpu.tickLimit + "] Bucket[" + Game.cpu.bucket
        + "] Used[" + (Memory.stats.cpu.used = Game.cpu.getUsed()).toFixed(3) + "]";
    }

    /**
     * Fetch our heapStats to memory and return a string for the console
     */
    private static HeapStats(): string {
        let msg = "";
        if (typeof Game.cpu.getHeapStatistics === "function") {
            // Traveler.structureMatrixCache = {};
            // Traveler.creepMatrixCache = {};
            const heapStats = Game.cpu.getHeapStatistics();
            if (_.isUndefined(heapStats)) {
                return "";
            }
            const heapPercent = Math.round(
                ((heapStats.total_heap_size + heapStats.externally_allocated_size) / heapStats.heap_size_limit)
                    * 100);
            if (heapPercent >= 80) {
                // console.log('Running GC'); gc();
            }
            const heapTotal = Math.round((heapStats.total_heap_size) / 1048576);
            const heapAlloc = Math.round((heapStats.externally_allocated_size) / 1048576);
            const heapLimit = Math.round(heapStats.heap_size_limit / 1048576);
            msg += ":HEAP: [" + heapTotal + "MB +" + heapAlloc + "MB of " + heapLimit + "MB (" + heapPercent + "%)]";
            const heap = {
                percent: heapPercent,
                total: heapStats.total_heap_size,
                // tslint:disable-next-line:object-literal-sort-keys
                allocated: heapStats.externally_allocated_size,
                total_d: heapTotal,
                alloc_d: heapAlloc
            };
            Memory.stats.mem = heap;
        }
        return msg;
    }
}
