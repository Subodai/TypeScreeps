// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// Delcare global object
declare let global: { [k: string]: any };

interface OwnedStructure {
    memory: { [k: string]: any };
    targetted: number;
    initMemory(): void;
}

interface StructureSpawn {
    log(msg: string): void;
    // memory: { [k: string]: any };
}

interface SpawnMemory {
    debug?: boolean;
}

interface Source {
    memory: { [k: string]: any};
}

/// <reference types="typed-screeps" />

// TODO ADD & This to the creeps one
// interface StoreDefinition {
//     [k: string]: number;
// }
