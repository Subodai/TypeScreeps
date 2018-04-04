import { Debug } from "functions/debug";
import { loadColours } from "./colours";
import { loadConstants } from "./constants";
import { ALLIES, ENEMIES, loadDiplomacy } from "./diplomacy";
import { loadSpeech } from "./speech";

export function init(): void {
    Debug.Load("Config: Initiation");
    loadConstants();
    loadColours();
    loadDiplomacy();
    loadSpeech();
    if (Memory.debugEnabled === undefined) {
        Memory.debugEnabled = true;
    }
    if (Memory.creepDebug === undefined) {
        Memory.creepDebug = true;
    }
    if (Memory.roomDebug === undefined) {
        Memory.roomDebug = true;
    }
    if (Memory.memoryDebug === undefined) {
        Memory.memoryDebug = true;
    }
    if (Memory.spawnDebug === undefined) {
        Memory.spawnDebug = true;
    }
}
