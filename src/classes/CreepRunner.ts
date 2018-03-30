import { ROLES } from "config/constants";
import { Debug } from "functions/debug";

export class CreepRunner {
    private static runEvery: number = 1;
    private static softLimit: number = 2;

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
        for (const i in ROLES) {
            this.role(ROLES[i]);
        }
    }

    private static rooms(): void {
        Debug.Log("Running Rooms");
    }

    private static role(role: string): boolean {
        // for (const name in Game.creeps) {
        //     const worker = Game.creeps[name];
        //     if (worker.state === STATE_SPAWN) {

        //     }
        // }
        return true;
    }
}
