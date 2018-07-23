class Empire implements Empire {

    /**
     * Request Queue
     */
    public requestQueue!: ResourceRequest[];

    /**
     * Add a request to the queue
     *
     * @param room
     * @param resource
     * @param amount
     */
    public addRequest(room: Room, resource: ResourceConstant, amount: number): void {
        if (this.requestQueue === undefined || this.requestQueue === null) {
            this.loadQueueFromCache();
        }
        const id = this.getNextId();
        const request: ResourceRequest = {
             id,
             room: room.name,
             // tslint:disable-next-line:object-literal-sort-keys
             resource,
             amount
        };

        this.requestQueue.push(request);
        this.saveQueueToCache();
    }

    /**
     * Remove an item from the request queue
     * @param id
     */
    public removeRequest(id: number): void {
        if (this.requestQueue === undefined || this.requestQueue === null) {
            this.loadQueueFromCache();
        }
        _.remove(this.requestQueue, (c: ResourceRequest) => c.id === id);
        this.saveQueueToCache();
    }

    /**
     * Fulfil a request
     * @param id
     * @param room
     */
    public fulfilRequest(id: number, room: Room, amount: number): ScreepsReturnCode {
        const request: ResourceRequest = _.first(_.filter(this.requestQueue, (c: ResourceRequest) => c.id = id));
        if (request === null) {
            return ERR_INVALID_ARGS;
        }
        const from = room.terminal;
        if (from === null || from === undefined) {
            return ERR_INVALID_ARGS;
        }
        const to = Game.rooms[request.room].terminal;
        if (to === null || to === undefined) {
            return ERR_INVALID_TARGET;
        }
        let energyCost: number = Game.market.calcTransactionCost(amount, room.name, request.room);
        let resourceCost: number = 0;
        // if it's energy, we'll need the cost + the amount
        if (request.resource === RESOURCE_ENERGY) {
            energyCost += amount;
            const energy = from.store[RESOURCE_ENERGY] || 0;
            if (energy <= energyCost) {
                return ERR_NOT_ENOUGH_ENERGY;
            }
        } else {
            resourceCost += amount;
            const energy = from.store[RESOURCE_ENERGY] || 0;
            const resource = from.store[request.resource] || 0;
            if (energy <= energyCost) {
                return ERR_NOT_ENOUGH_ENERGY;
            }
            if (resource <= resourceCost) {
                return ERR_NOT_ENOUGH_RESOURCES;
            }
        }
        // if we got to this point, we should have enough of everything!
        const response = from.send(request.resource, amount, to.room.name, "Fulfilling Request ID: " + request.id);
        if (response === OK) {
            request.amount -= amount;
            if (request.amount <= 0) {
                this.removeRequest(request.id);
            }
        } else {
            return response;
        }
        this.saveQueueToCache();
        return OK;
    }

    /**
     * Checks the queue, and gives an unused Id
     */
    private getNextId(): number {
        if (this.requestQueue.length === 0) {
            return 1;
        }
        const request = _.max(this.requestQueue, (c: ResourceRequest) => c.id);
        return request.id + 1;
    }

    /**
     * Load The requestQueue from memory into our Empire object
     */
    public loadQueueFromCache(): void {
        this.checkAndInitCache();
        this.requestQueue = global.empire.requestQueue;
    }

    /**
     * Save the requestQueue out to memory
     */
    public saveQueueToCache(): void {
        this.checkAndInitCache();
        global.empire.requestQueue = this.requestQueue;
    }

    /**
     * Save Queue out to Memory (we should do this once per tick)
     */
    public saveQueueToMemory(): void {
        this.checkAndInitCache();
        Memory.empire.requestQueue = this.requestQueue;
    }

    /**
     * Checks global for the queue, and loads it from Memory if it's not there
     */
    private checkAndInitCache(): void {
        // Do we have empire setup in global?
        if (!global.empire || !global.empire.requestQueue) {
            // Check and init memory
            this.checkAndInitMemory();
            // Pull from memory
            global.empire = Memory.empire;
        }
    }
    /**
     * Make sure we have something to pull from Memory
     */
    private checkAndInitMemory(): void {
        if (!Memory.empire) { Memory.empire = {}; }
        if (!Memory.empire.requestQueue) { Memory.empire.requestQueue = []; }
    }
}

export { Empire };
