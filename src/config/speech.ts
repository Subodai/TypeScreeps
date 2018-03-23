import { Debug } from "functions/debug";

export function loadSpeech(): void {
    // Debug
    Debug.Load("Config: Speech");
    // Speech file
    global.sayTired = "Zzz";
    global.sayMove = ">>";
    global.sayAttack = "FU";
    global.sayUpgrade = "(>.<)";
    global.sayWithdraw = "^^";
    global.sayOhno = "OhNo!";
    global.sayGet = "GET";
    global.sayPut = "PUT";
    global.sayWhat = "!!";
    global.sayRepair = "SAP";
    global.sayMine = "d(^-^)b";
    global.sayBuild = "MAKE";
    global.sayDrop = "VV";
}
