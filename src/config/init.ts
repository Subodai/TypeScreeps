import { Debug } from "functions/debug";
import { loadColours } from "./colours";
import { loadConstants } from "./constants";
import { loadDiplomacy } from "./diplomacy";
import { loadSpeech } from "./speech";

export function init(): void {
    Debug.Load("Config: Initiation");
    loadConstants();
    loadColours();
    loadDiplomacy();
    loadSpeech();
}
