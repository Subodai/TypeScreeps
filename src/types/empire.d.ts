interface ResourceRequest {
    id: number;
    room: string;
    resource: ResourceConstant;
    amount: number;
}

interface ReactionRequest {
    id: number;
    room: string;
    compound: ResourceConstant;
    amount: number;
}

interface Empire {
    /**
     * The queue of requests
     */
    requestQueue: ResourceRequest[];

    /**
     * Add a request to the queue
     * @param room
     * @param res
     * @param amount
     */
    addRequest(room: Room, res: ResourceConstant, amount: number): void;

    /**
     * Remove a request from the queue
     */
    removeRequest(id: number): void;

    /**
     * Get the top request details
     */
    getTopRequest(): ResourceRequest;

    /**
     * Get all the requests
     */
    getAllRequests(): ResourceRequest[];

    /**
     * Fulfil a request from a room
     */
    fulfilRequest(id: number, room: Room, amount: number): ScreepsReturnCode;

    /**
     * Run through the queue and check for possible fulfillers!
     */
    processRequestQueue(): void;

    loadQueueFromCache(): void;
    saveQueueToCache(): void;
    saveQueueToMemory(): void;
}
