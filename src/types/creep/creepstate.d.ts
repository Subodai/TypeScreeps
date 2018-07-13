/**
 * State consts
 */
declare const _SPAWN     = 0;
declare const _INIT      = 1;
declare const _MOVE      = 2;
declare const _ARRIVED   = 3;
declare const _DELIVER   = 4;
declare const _DONE      = 5;
declare const _MINE      = 6;
declare const _UPGRADE   = 7;
declare const _GATHER    = 8;
declare const _CONSTRUCT = 9;
declare const _RETURN    = 10;
declare const _CHARGE    = 11;
declare const _GATHERM   = 12;

/**
 * State types
 */
type _SPAWN     = 0;
type _INIT      = 1;
type _MOVE      = 2;
type _ARRIVED   = 3;
type _DELIVER   = 4;
type _DONE      = 5;
type _MINE      = 6;
type _UPGRADE   = 7;
type _GATHER    = 8;
type _CONSTRUCT = 9;
type _RETURN    = 10;
type _CHARGE    = 11;
type _GATHERM   = 12;

/**
 * CreepStates
 */
type CreepState =
      _SPAWN
    | _INIT
    | _MOVE
    | _ARRIVED
    | _DELIVER
    | _DONE
    | _MINE
    | _UPGRADE
    | _GATHER
    | _CONSTRUCT
    | _RETURN
    | _CHARGE
    | _GATHERM
    ;
