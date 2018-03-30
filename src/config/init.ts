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
    Memory.debugEnabled = true;
    Memory.creepDebug = true;
    Memory.roomDebug = true;
    Memory.memoryDebug = true;
    Memory.spawnDebug = true;
}
