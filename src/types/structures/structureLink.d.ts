interface StructureLink {
    /**
     * linkType: Storage for links near storage, receiver for links near controller
     */
    linkType: any;
    /**
     * Runs a link
     */
    runReceiver(): number;
    countCPU(start: number): number;
    log(msg: string): void;
}
