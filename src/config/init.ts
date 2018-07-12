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
        Memory.debugEnabled = false;
    }
    if (Memory.creepDebug === undefined) {
        Memory.creepDebug = false;
    }
    if (Memory.roomDebug === undefined) {
        Memory.roomDebug = false;
    }
    if (Memory.memoryDebug === undefined) {
        Memory.memoryDebug = false;
    }
    if (Memory.spawnDebug === undefined) {
        Memory.spawnDebug = false;
    }
    Memory.debugEnabled = true;
    Memory.creepDebug = false;
    Memory.roomDebug = false;
    Memory.memoryDebug = false;
    Memory.spawnDebug = false;
}
