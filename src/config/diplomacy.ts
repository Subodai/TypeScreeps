import { Debug } from "functions/debug";

export function loadDiplomacy(): void {
    // Debug
    Debug.Load("Config: Diplomacy");
    /*
    * The global shitlist
    */
    global.enemies = [];

    /*
    * The global NAPList or friends, add people to this to make
    * sure your creeps and rooms are not hostile to them
    */
    global.friends = [
        "Source Keeper",
        "admon", "Baj", "cazantyl", "DoctorPC", "Geir1983",
        "InvisioBlack", "Issacar", "Komir", "likeafox", "Lolzor",
        "ncsupheo", "NobodysNightmare", "omnomwombat", "Parthon", "Plemenit",
        "poppahorse", "Rengare", "Subodai", "Tantalas", "Tijnoz",
        "Totalschaden", "Vlahn", "W4rl0ck", "weaves", "Xaq",
        "Yilmas", "Zeekner", "Zyzyzyryxy", "samogot"
    ];

    /**
     * Global Yipsilon Prime list
     */
    global.prime = [];
}
