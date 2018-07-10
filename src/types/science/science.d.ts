interface TaskQueueInterface {
    queue: ScienceTask[];
}

interface ScienceInterface {
    queue: ScienceRequest[];
    reactions: ScienceReaction[];
    log(message: string): void;
    load(): void;
    save(): void;
    addRequest(room: Room, type: ResourceConstant, amount: number): void;
}

interface ScienceRequest {
    room: Room;
    resource: ResourceConstant;
    amount: number;
}

interface ScienceReaction {
    room: Room;
    outputLab: StructureLab;
    sourceLab1: StructureLab;
    sourceLab2: StructureLab;
    inputMineral1: ResourceConstant;
    inputMineral2: ResourceConstant;
    outputMineral: ResourceConstant;
}

interface ScienceTaskType {
    name: string;
}

interface ScienceTask {
    type: ScienceTaskType;
    assignedCreep: Creep;
    from?: string;
    to?: string;
    amount?: number;
}
