
interface ScienceInterface {
    queue: QueuedCompound[];
    reactions: QueuedReaction[];
    load(): void;
    save(): void;
    addRequest(type: ResourceConstant, amount: number): void;
}

interface QueuedCompound {
    resource: ResourceConstant;
    amount: number;
}

interface QueuedReaction {
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

    private _queue: QueuedCompound[] = [];
    private _reactions: QueuedReaction[] = [];

    public get reactions(): QueuedReaction[] {
        return this._reactions;
    }

    public set reactions(value: QueuedReaction[]) {
        this._reactions = value;
    }

    public get queue(): QueuedCompound[] {
        return this._queue;
    }

    public set queue(queue: QueuedCompound[]) {
        this._queue = queue;
    }

    public save(): void {
        this.saveRequests();
        this.saveReactions();
    }

    private saveRequests(): void {
        _.set(Memory, "scienceQueue", this._queue);
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
        _.set(Memory, "scienceReactions", reactions);
    }

    public load(): void {
        this.loadRequests();
        this.loadReactions();
    }

    private loadRequests(): void {
        // Queue can come straight from memory
        this._queue = Memory.scienceQueue;
    }

    private loadReactions(): void {
        // Reactions needs to be processed back out
        this._reactions = [];
        const reactions = Memory.scienceReactions;
        for (const item of reactions) {
            const reaction: QueuedReaction = {
                inputMineral1: item.inputMineral1 as ResourceConstant,
                inputMineral2: item.inputMineral2 as ResourceConstant,
                outputLab: Game.getObjectById(item.outputLab) as StructureLab,
                outputMineral: item.outputMineral as ResourceConstant,
                sourceLab1: Game.getObjectById(item.sourceLab1) as StructureLab,
                sourceLab2: Game.getObjectById(item.sourceLab2) as StructureLab
            };
            this._reactions.push(reaction);
        }
    }

    public constructor() {
        this.load();
    }

    public addRequest(type: ResourceConstant, amount: number): void {
        this.loadRequests();
        const request: QueuedCompound = {
            amount,
            resource: type
        };
        this._queue.push(request);
        this.saveRequests();
    }
}

export { Science };
