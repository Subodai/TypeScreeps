// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// Delcare global object
declare let global: { [k: string]: any };

interface RoomPosition {
    isRoomEdge(): boolean;
}

interface OwnedStructure {
    memory: { [k: string]: any };
}

interface StructureSpawn {
    log(msg: string): void;
    memory: { [k: string]: any };
}

interface Source {
    memory: { [k: string]: any};
}

/// <reference types="typed-screeps" />
