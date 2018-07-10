class TaskQueue implements TaskQueueInterface {
    private _queue: ScienceTask[] = [];

    public get queue(): ScienceTask[] {
        return this._queue;
    }

    public set queue(value: ScienceTask[]) {
        this._queue = value;
    }
}
