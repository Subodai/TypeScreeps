interface ResourceRequest {
    id: number;
    room: string;
    resource: ResourceConstant;
    amount: number;
    requestedAmount: number;
}

interface ReactionRequest {
    id: number;
    room: string;
    compound: ResourceConstant;
    amount: number;
}

interface CompletedResourceRequest extends ResourceRequest{}

interface Empire {
    requestQueue: ResourceRequest[];
    addRequest(room: Room, res: ResourceConstant, amount: number): void;
    removeRequest(id: number): void;
    getTopRequest(): ResourceRequest;
    getAllRequests(): ResourceRequest[];
    fulfilRequest(id: number, room: Room, amount: number): ScreepsReturnCode;
    processRequestQueue(): void;
    loadQueueFromCache(): void;
    saveQueueToCache(): void;
    saveQueueToMemory(): void;
    getRequestQueue(): ResourceRequest[];
    run(): void;
}
