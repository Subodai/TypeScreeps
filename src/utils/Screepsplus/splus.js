// Module to format data in memory for use with the https://screepspl.us
// Grafana utility run by ags131.
//
// Installation: Run a node script from https://github.com/ScreepsPlus/node-agent
// and configure your screepspl.us token and Screeps login (if you use Steam,
// you have to create a password on the Profile page in Screeps),
// then run that in the background (e.g., on Linode, AWS, your always-on Mac).
//
// Then, put whatever you want in Memory.stats, which will be collected every
// 15 seconds (yes, not every tick) by the above script and sent to screepspl.us.
// In this case, I call the collect_stats() routine below at the end of every
// trip through the main loop, with the absolute final call at the end of the
// main loop to update the final CPU usage.
//
// Then, configure a Grafana page (see example code) which graphs stuff whichever
// way you like.
//
// This module uses my resources module, which analyzes the state of affairs
// for every room you can see.

"use strict";
const resources = require('resources');
const economy = require('economy');
const cb = require('callback');

global.stats_callbacks = new cb.Callback();

// Tell us that you want a callback when we're collecting the stats.
// We will send you in the partially completed stats object.
function add_stats_callback(cbfunc) {
    global.stats_callbacks.subscribe(cbfunc);
}


// Update the Memory.stats with useful information for trend analysis and graphing.
// Also calls all registered stats callback functions before returning.
function collect_stats() {

    // Don't overwrite things if other modules are putting stuff into Memory.stats
    if (Memory.stats == null) {
        Memory.stats = { tick: Game.time };
    }
    if (global.born) {
        Memory.stats.age = Game.time - global.born;
    } else {
        Memory.stats.age = 0;
    }

    // Note: This is fragile and will change if the Game.cpu API changes
    Memory.stats.cpu = Game.cpu;
    // Memory.stats.cpu.used = Game.cpu.getUsed(); // AT END OF MAIN LOOP

    // Note: This is fragile and will change if the Game.gcl API changes
    Memory.stats.gcl = Game.gcl;

    const memory_used = RawMemory.get().length;
    // console.log('Memory used: ' + memory_used);
    Memory.stats.memory = {
        used: memory_used,
        // Other memory stats here?
    };

    Memory.stats.market = {
        credits: Game.market.credits,
        num_orders: Game.market.orders ? Object.keys(Game.market.orders).length : 0,
    };

    Memory.stats.roomSummary = resources.summarize_rooms();
    if (Memory.queue) {
        Memory.stats.queue = Memory.queue;
        Memory.stats.queue.length = Memory.queue.creeps.length;
    }
    Memory.stats.empireMinerals = global.summarized_minerals;

    // Fetch market state every 100 ticks
    if (Game.time % 2 == 0) {
        Memory.stats.economy = economy.get_economy();
    }
    // Add callback functions which we can call to add additional
    // statistics to here, and have a way to register them.
    // 1. Merge in the current repair ratchets into the room summary
    // TODO: Merge in the current creep desired numbers into the room summary
    global.stats_callbacks.fire(Memory.stats);
} // collect_stats

module.exports = {
    collect_stats,
    add_stats_callback,
};
