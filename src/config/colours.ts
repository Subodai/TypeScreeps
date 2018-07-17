import { Debug } from "functions/debug";

export function loadColours(): void {
    // Debug
    Debug.Load("Config: Colours");
    // The path opacity
    global.pathOpacity = .3;

    // flag colors
    global.flagColor = {
        avoid: COLOR_BROWN,
        buildsite: COLOR_WHITE,
        claim: COLOR_GREY,
        defend: COLOR_ORANGE,
        friendly: COLOR_BLUE,
        haul: COLOR_GREEN,
        invade: COLOR_RED,
        remote: COLOR_YELLOW,
        reserve: COLOR_PURPLE,
        suspicious: COLOR_CYAN
    };

    global.flagSecondaryColor = {
        BLUE: COLOR_BLUE,
        BROWN: COLOR_BROWN,
        CYAN: COLOR_CYAN,
        GREEN: COLOR_GREEN,
        GREY: COLOR_GREY,
        ORANGE: COLOR_ORANGE,
        PURPLE: COLOR_PURPLE,
        RED: COLOR_RED,
        WHITE: COLOR_WHITE,
        YELLOW: COLOR_YELLOW
    };

    global.buildColor = {
        1: STRUCTURE_TOWER,      // COLOR_RED
        10: STRUCTURE_ROAD,      // COLOR_WHITE
        6: STRUCTURE_EXTENSION,  // COLOR_YELLOW
        9: STRUCTURE_SPAWN,      // COLOR_GREY
        8: STRUCTURE_WALL,       // COLOR_BROWN
        5: STRUCTURE_LINK,       // COLOR_GREEN
        3: STRUCTURE_STORAGE,    // COLOR_BLUE
        4: STRUCTURE_TERMINAL,   // COLOR_CYAN
        2: STRUCTURE_LAB,        // COLOR_PURPLE
        7: STRUCTURE_EXTRACTOR  // COLOR_ORANGE
    };
}
