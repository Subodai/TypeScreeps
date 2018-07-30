import { Debug } from "./debug";

class Empire implements Empire {

    /**
     * Request Queue
     */
    public requestQueue!: ResourceRequest[];
    public completedRequests!: CompletedResourceRequest[];

    /**
     * Run our tasks
     */
    public run(): void {
        // TODO run this off a list of methods, with a tick count for each etc, sleepers between
        const start = Game.cpu.getUsed();
        this.processRequestQueue();
        const end = Game.cpu.getUsed() - start;
        this.log("Used " + end.toFixed(3) + " CPU");
    }
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
             amount,
             requestedAmount : amount
        };

        this.requestQueue.push(request);
        this.logAlways("Added Request for " + amount + " of " + resource + " From:[" + room.name + "]");
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
     * Complete a request and put it into the completed list
     * @param id
     */
    public completeRequest(id: number): void {
        if (this.requestQueue === undefined || this.requestQueue === null ||
        this.completedRequests === undefined || this.completedRequests === null) {
            this.loadQueueFromCache();
        }
        const request: ResourceRequest = _.first(_.filter(this.requestQueue, (c: ResourceRequest) => c.id = id));
        const complete = request as CompletedResourceRequest;
        this.completedRequests.push(complete);
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
            // if (request.amount <= 0) {
            //     this.completeRequest(request.id);
            // }
        } else {
            return response;
        }
        this.saveQueueToCache();
        return OK;
    }

    /**
     * Process the request queue
     */
    public processRequestQueue(): void {
        if (this.requestQueue === undefined || this.requestQueue === null) {
            this.loadQueueFromCache();
        }
        this.logAlways("Preparing to run process queue");
        if (this.requestQueue.length === 0) {
            this.logAlways("No requests to process");
            this.clearAllTerminalCharges();
            // If we're attempting to charge a room, lets process that
            if (global.chargeRoom) {
                const room = Game.rooms[global.chargeRoom];
                // check for terminal
                if (room.terminal && room.controller) {
                    // Check it has no energy
                    if (room.controller.level < 8 && room.terminal.store[RESOURCE_ENERGY] === 0) {
                        // put in a request
                        this.addRequest(room, RESOURCE_ENERGY, 300000);
                    }
                }
            }
            // todo sleep?
            return;
        }
        const request = _.first(this.requestQueue);
        this.log("Attempting to process request " + request.id);

        const receiver: StructureTerminal | undefined = Game.rooms[request.room].terminal;
        if (receiver === undefined) {
            this.logAlways("Sending Couriers to empire request");
            // We need to send couriers instead
            this.sendCouriersTo(request);
            return;
        } else {
            this.logAlways("Sending Resources via terminals");
            this.sendResourcesViaTerminalsTo(request, receiver);
            return;
        }

    }

    private sendCouriersTo(request: ResourceRequest): void {
        const myRooms = _.filter(Game.rooms, (r: Room) =>
            r.controller && r.controller.my &&
            Game.map.getRoomLinearDistance(r.name, request.room) <= 3 &&
            r.name !== request.room
        );

        for (const room of myRooms) {
            room.memory.courierTarget = request.room;
        }
    }

    private sendResourcesViaTerminalsTo(request: ResourceRequest, receiver: StructureTerminal): void {
        let amount = request.amount;
        let space = receiver.storeCapacity - _.sum(receiver.store);
        if (space === 0) {
            this.logAlways("No Space at destination holding transfers");
            this.clearAllTerminalCharges();
            return;
        }
        const myRooms = _.filter(Game.rooms, (r: Room) =>
            r.controller && r.controller.my &&
            r.name !== request.room
        );
        for (const room of myRooms) {
            const name = room.name;
            this.log("Checking " + name);
            if (name === request.room) {
                this.log("This is the requesting room");
                // Make sure it's not trying to charge it's terminal
                room.memory.prioritise = "none";
                continue;
            }

            if (amount <= 0) {
                this.log("Request fulfilled removing");
                this.removeRequest(request.id);
                return;
            }

            if (space <= 0) {
                this.log("Not enough space, putting on hold");
                return;
            }

            if (room.terminal && room.storage) {
                const totalEnergy = _.sum([room.terminal.store.energy, room.storage.store.energy]);
                if (totalEnergy <= 200000) {
                    this.log("Room below min energy level, " + totalEnergy + "  skipping");
                    room.memory.prioritise = "none";
                    continue;
                }
                this.log("Room has enough energy in storage and terminal to continue");
            }

            if (room.terminal && room.memory.charging === true) {
                this.log(name + " Has a terminal and is charging");
                // Get how much we have
                const stored = room.terminal.store[request.resource] || 0;
                // get the cost per 1000
                const costPer = Game.market.calcTransactionCost(1000, room.name, request.room);
                const totalCost = 1000 + costPer;
                const multiplier = Math.floor(stored / totalCost);
                const toSend = multiplier * 1000;
                this.log("Has " + stored + " Of the item in terminal");
                if (stored === 0) {
                    this.log("Has none of requested resource");
                    const storageStored = room.storage ? room.storage.store[request.resource] || 0 : 0;
                    if (storageStored > 0) {
                        this.log("Has some in storage (probably energy)");
                        this.log("Charging terminal");
                        room.memory.prioritise = "terminal";
                    }
                }
                if (stored >= 1000) {
                    const send = _.min([toSend, amount, space]);
                    const price = Game.market.calcTransactionCost(send, room.name, request.room);
                    this.log("Attempting to send " + send + " at a cost of " + price + " Total: " + (price + send));
                    const result = this.fulfilRequest(request.id, room, send);
                    switch (result) {
                        case OK:
                            this.logAlways("Successful send from [" + room.name + "] reducing amount by " + send);
                            amount -= send;
                            space -= send;
                            break;
                        case ERR_NOT_ENOUGH_ENERGY:
                            room.memory.prioritise = "terminal";
                            this.log("Not enough energy charging terminal in " + name);
                            break;
                        case ERR_NOT_ENOUGH_RESOURCES:
                            // Not enough resources? wtf?
                            this.log("Not enough resources");
                            break;
                        case ERR_INVALID_TARGET:
                            // invalid target
                            this.log("Invalid Target");
                            break;
                        default:
                            // Something went wrong
                            this.log(result + " Response from terminal send");
                            break;
                    }
                } else {
                    this.log("Not quite enough to send yet");
                }
            } else {
                this.log("No terminal, or not charging");
            }
        }
    }

    /**
     * Clear all terminal priorities
     */
    private clearAllTerminalCharges(): void {
        this.logAlways("Clearing terminal charge states");
        for (const name in Game.rooms) {
            const room = Game.rooms[name];
            if (!room.controller) { continue; }
            if (!room.controller.my) { continue; }
            if (room.memory.override) { continue; }
            room.memory.prioritise = "none";
            delete room.memory.courierTarget;
        }
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
        this.completedRequests = global.empire.completedRequests;
    }

    /**
     * Save the requestQueue out to memory
     */
    public saveQueueToCache(): void {
        this.checkAndInitCache();
        global.empire.requestQueue = this.requestQueue;
        global.empire.completedRequests = this.completedRequests;
    }

    /**
     * Save Queue out to Memory (we should do this once per tick)
     */
    public saveQueueToMemory(): void {
        this.checkAndInitCache();
        Memory.empire.requestQueue = this.requestQueue;
        Memory.empire.completedRequests = this.completedRequests;
    }

    /**
     * Checks global for the queue, and loads it from Memory if it's not there
     */
    private checkAndInitCache(): void {
        // Do we have empire setup in global?
        if (!global.empire || !global.empire.requestQueue || !global.empire.completedRequests) {
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
        if (!Memory.empire.completedRequests) { Memory.empire.completedRequests = []; }
    }

    private log(message: string): void {
        let msg: string = "";
        msg += "<span style='color:" + Debug.cRed + ";'>[EMPIRE]</span> ";
        msg += message;
        Debug.Log(msg);
    }

    private logAlways(message: string): void {
        let msg: string = "";
        msg += "<span style='color:" + Debug.cRed + ";'>[EMPIRE]</span> ";
        msg += message;
        Debug.LogAlways(msg);
    }
}

export { Empire };
