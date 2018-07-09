import { Debug } from "./debug";

interface ScienceInterface {
    queue: Request[];
    reactions: Reaction[];
    log(message: string): void;
    load(): void;
    save(): void;
    addRequest(room: Room, type: ResourceConstant, amount: number): void;
}

interface Request {
    room: Room;
    resource: ResourceConstant;
    amount: number;
}

interface Reaction {
    room: Room;
    outputLab: StructureLab;
    sourceLab1: StructureLab;
    sourceLab2: StructureLab;
    inputMineral1: ResourceConstant;
    inputMineral2: ResourceConstant;
    outputMineral: ResourceConstant;
}
/**
 * Science class, handles labs and reactions
 */
class Science implements ScienceInterface {
    /**
     * Queue of items we want
     */
    private _queue: Request[] = [];

    /**
     * Queue of reactions to happen
     */
    private _reactions: Reaction[] = [];

    /**
     * Class Constructor
     */
    public constructor() {
        this.load();
    }

    /**
     * Log Something
     * @param message The text you want to send
     */
    public log(message: string): void {
        const msg: string = "[Science] " + message;
        Debug.Log(msg);
    }

    /**
     * Load our queue's into global
     */
    public load(): void {
        this.loadRequests();
        this.loadReactions();
    }

    /**
     * Load Request queue into global
     */
    private loadRequests(): void {
        if (undefined === global.scienceQueue) {
            this.log("Loading request queue from memory");
            global.scienceQueue = Memory.scienceQueue ? Memory.scienceQueue : [];
        }
        // clear queue
        this._queue = [];
        // grab the queue from global
        const requests = global.scienceQueue;
        // loop through and transpose into usable objects
        for (const item of requests) {
            const request: Request = {
                amount: item.amount,
                resource: item.resource as ResourceConstant,
                room : Game.rooms[item.room] as Room
            };
            this._queue.push(request);
        }
    }

    /**
     * Load Reaction queue into global
     */
    private loadReactions(): void {
        if (undefined === global.scienceReactions) {
            this.log("Loading reaction list from memory");
            global.scienceReactions = Memory.scienceReactions ? Memory.scienceReactions : [];
        }
        // Reactions needs to be processed back out
        this._reactions = [];
        const reactions = global.scienceReactions;
        for (const item of reactions) {
            const reaction: Reaction = {
                inputMineral1: item.inputMineral1 as ResourceConstant,
                inputMineral2: item.inputMineral2 as ResourceConstant,
                outputLab: Game.getObjectById(item.outputLab) as StructureLab,
                outputMineral: item.outputMineral as ResourceConstant,
                room: Game.rooms[item.room] as Room,
                sourceLab1: Game.getObjectById(item.sourceLab1) as StructureLab,
                sourceLab2: Game.getObjectById(item.sourceLab2) as StructureLab
            };
            this._reactions.push(reaction);
        }
    }

    public get reactions(): Reaction[] {
        return this._reactions;
    }

    public set reactions(value: Reaction[]) {
        this._reactions = value;
    }

    public get queue(): Request[] {
        return this._queue;
    }

    public set queue(queue: Request[]) {
        this._queue = queue;
    }

    public save(): void {
        this.saveRequests();
        this.saveReactions();
    }

    private saveRequests(): void {
        const requests = [];
        for (const item of this._queue) {
            const obj = {
                amount: item.amount,
                resource: item.resource,
                room: item.room.name
            };
            requests.push(obj);
        }
        global.scienceQueue = requests;
        _.set(Memory, "scienceQueue", requests);
    }

    private saveReactions(): void {
        const reactions = [];
        for (const item of this._reactions) {
            const obj = {
                inputMineral1: item.inputMineral1,
                inputMineral2: item.inputMineral2,
                outputLab: item.outputLab.id,
                outputMineral: item.outputMineral,
                sourceLab1: item.sourceLab1.id,
                sourceLab2: item.sourceLab2.id
            };
            reactions.push(obj);
        }
        global.scienceReactions = reactions;
        _.set(Memory, "scienceReactions", reactions);
    }

    public addRequest(room: Room, resource: ResourceConstant, amount: number): void {
        this.loadRequests();
        const request: Request = {
            amount,
            resource,
            room
        };
        this._queue.push(request);
        this.saveRequests();
    }
}

export { Science };
