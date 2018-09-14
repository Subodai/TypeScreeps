/**
 * State consts
 */
declare const _SPAWN     = "spawn";
declare const _INIT      = "init";
declare const _MOVE      = "move";
declare const _ARRIVED   = "arrived";
declare const _DELIVER   = "deliver";
declare const _DONE      = "done";
declare const _MINE      = "mine";
declare const _UPGRADE   = "upgrade";
declare const _GATHER    = "gather";
declare const _CONSTRUCT = "construct";
declare const _RETURN    = "return";
declare const _CHARGE    = "charge";
declare const _GATHERM   = "gatherm";
declare const _DELIVERM  = "deliverm";
declare const _ATTACK    = "attack";

/**
 * State types
 */
type _SPAWN     = "spawn";
type _INIT      = "init";
type _MOVE      = "move";
type _ARRIVED   = "arrived";
type _DELIVER   = "deliver";
type _DONE      = "done";
type _MINE      = "mine";
type _UPGRADE   = "upgrade";
type _GATHER    = "gather";
type _CONSTRUCT = "construct";
type _RETURN    = "return";
type _CHARGE    = "charge";
type _GATHERM   = "gatherm";
type _DELIVERM  = "deliverm";
type _ATTACK    = "attack";

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
    | _DELIVERM
    | _ATTACK
    ;
