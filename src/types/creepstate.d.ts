/**
 * State consts
 */
declare const _SPAWN = 0;
declare const _INIT = 1;
declare const _MOVE = 2;
declare const _ARRIVED = 3;
declare const _DELIVER = 4;
declare const _DONE = 5;

/**
 * State types
 */
type _SPAWN = 0;
type _INIT = 1;
type _MOVE = 2;
type _ARRIVED = 3;
type _DELIVER = 4;
type _DONE = 5;
type _MINE = 6;

/**
 * CreepStates
 */
type CreepState =
    _SPAWN |
    _INIT |
    _MOVE |
    _ARRIVED |
    _DELIVER |
    _DONE |
    _MINE;
