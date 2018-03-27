import { Debug } from "functions/debug";

export class CreepRunner {
    private static runEvery: number = 1;

    public static run(): void {
        if (Game.time % this.runEvery === 0) {
            Debug.Log("Running Creeps");
            const cpu: number = Game.cpu.getUsed();
            this.creeps();
            this.rooms();
            Debug.Log("Creep Runner used " + (Game.cpu.getUsed() - cpu).toFixed(3) + " CPU");
        }
    }

    private static creeps(): void {
        Debug.Log("Running Creeps");
        for (const i in global.roles) {
            this.role(global.roles[i]);
        }
    }

    private static rooms(): void {
        Debug.Log("Running Rooms");
    }

    private static role(roleName: string): boolean {
        return true;
        // if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) {

        // }
    }
}
