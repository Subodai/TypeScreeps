# TypeScreeps — CLAUDE.md

## What This Project Is

[Screeps](https://screeps.com) is a real-time multiplayer programming game where you write JavaScript/TypeScript AI to control units ("creeps") that harvest resources, build structures, and compete in a persistent MMO world. Your code runs on Screeps' servers every game tick (~1 second).

This codebase (**TypeScreeps**) is a TypeScript-based Screeps AI by **Subodai** (~7,674 lines, v0.0.1). It was originally a learning project to convert a JavaScript Screeps bot to TypeScript while improving its architecture. It supports multi-room empire management across the official Screeps server, private servers, and the simulator.

---

## Build & Deploy

**Bundler:** Rollup + `rollup-plugin-typescript2`

```bash
npm install          # Install dependencies

npm run lint         # Run TSLint

npm run push-main    # Build and deploy to official Screeps server
npm run push-pserver # Build and deploy to private server
npm run push-sim     # Build and deploy to simulator

npm run watch-main    # Watch + auto-deploy to official server
npm run watch-pserver # Watch + auto-deploy to private server
npm run watch-sim     # Watch + auto-deploy to simulator
```

**Credentials:** Create `.screeps.json` in the project root (gitignored):

```json
{
  "main":    { "email": "you@example.com", "password": "...", "branch": "default", "ptr": false },
  "pserver": { "host": "localhost", "port": 21025, "http": true, "username": "...", "password": "...", "branch": "default" },
  "sim":     { "email": "you@example.com", "password": "...", "branch": "default", "ptr": false }
}
```

**Output:** `dist/main.js` — single bundled file uploaded to the game server.

---

## Project Structure

```
src/
├── main.ts              # Entry point and game loop
├── config/
│   ├── constants.ts     # ROLES array, ROLEMODELS, CPU limits, room settings
│   ├── diplomacy.ts     # ALLIES and ENEMIES player lists
│   ├── states.ts        # State machine constants (_INIT, _GATHER, etc.)
│   ├── colours.ts       # Console color definitions
│   ├── speech.ts        # Global broadcast messages
│   └── init.ts          # Bootstraps config on load
├── functions/
│   ├── Empire.ts        # Inter-room resource logistics (~407 lines)
│   ├── runner.ts        # Per-tick role/tower/link/lab execution
│   ├── spawner.ts       # Creep spawning logic (runs every 10 ticks)
│   ├── counter.ts       # Population counting and state tracking
│   └── cleaner.ts       # Memory pruning (runs every 10 ticks)
├── roles/               # One file per creep role (16 total)
├── prototypes/          # Extensions to Screeps native objects
│   ├── all.ts           # Prototype loader (import this)
│   ├── creep.ts         # Creep base extensions
│   ├── room.ts          # Room extensions
│   ├── structure.ts     # Structure (tower/link/lab/spawn) extensions
│   └── ...
├── types/               # TypeScript interface definitions (.d.ts)
│   ├── creep/creep.d.ts # Creep memory and behavior interfaces
│   ├── rooms/room.d.ts  # Room memory interface
│   └── empire.d.ts      # Empire request/queue types
└── utils/               # Utilities: Traveler pathfinding, ErrorMapper, profiler
```

---

## Architecture

### Game Loop (`main.ts`)

Each tick:
1. Load Empire state from Memory (tick 1) or global cache
2. Run **Counter** — tally creep populations per room
3. Run **Spawner** — spawn needed creeps (throttled to every 10 ticks)
4. Run **Runner** — execute all creep roles, towers, links, labs
5. Run **Cleaner** — prune dead creep/room memory (every 10 ticks)
6. Save Empire state back to Memory

### Core Systems

| System | File | Runs | Responsibility |
|--------|------|------|----------------|
| Runner | `functions/runner.ts` | Every tick | Executes role behaviors, towers, links, labs |
| Spawner | `functions/spawner.ts` | Every 10 ticks | Spawns creeps by priority via `ROLEMODELS` |
| Counter | `functions/counter.ts` | Every tick | Counts creep populations; hauler setup every 200 ticks |
| Cleaner | `functions/cleaner.ts` | Every 10 ticks | Prunes dead creep entries and stale room memory |
| Empire | `functions/Empire.ts` | Every tick | Inter-room logistics via terminal transfers + courier requests |

---

## Role System

There are **16 creep roles**, each defined as a class in `src/roles/`.

### Defined Roles

| Role | Purpose |
|------|---------|
| `Hassler` | Early-game generalist (work/carry/move) |
| `Miner` | Sits on a source and mines continuously |
| `Harvester` | Picks up dropped energy from miners |
| `Upgrader` | Upgrades the room controller |
| `Builder` | Constructs structures from construction sites |
| `Refiller` | Keeps spawns and towers topped up with energy |
| `Linker` | Moves energy into/out of links |
| `Janitor` | Cleans up stray dropped resources |
| `Destroyer` | Combat role (attack + ranged) |
| `Scientist` | Manages lab reactions |
| `MineralExtractor` | Extracts minerals from deposits |
| `Courier` | Delivers resources between rooms |
| `RemoteClaimer` | Claims remote rooms |
| `RemoteEnergyMiner` | Mines energy in remote rooms |
| `RemoteReserver` | Reserves remote rooms to prevent NPC reset |
| `RemoteEnergyHauler` | Hauls energy from remote rooms back home |

### Role Class Interface

Every role implements this static interface:

```typescript
class MyRole {
    static colour: string;              // Visualization color
    static roster: number[];            // Target count per RCL (index = RCL)
    static bodyStructure: BodyPartConstant[][]; // Body parts per RCL
    static ticksBeforeRenew: number;    // When to renew (ticks remaining)

    static enabled(room: Room): boolean // Should this role spawn in this room?
    static run(creep: Creep): void      // Execute this tick's behavior
}
```

### Adding a New Role

1. Create `src/roles/MyRole.ts` implementing the interface above.
2. Add the role string to `ROLES` in `src/config/constants.ts`.
3. Add the class reference to `ROLEMODELS` in the same file (same index as `ROLES`).
4. Add a corresponding entry to the `CreepMemory` role type in `src/types/`.

### Creep State Machine

Creeps use a state machine stored in `creep.memory.state`. States are defined in `src/config/states.ts`:

| State | Meaning |
|-------|---------|
| `_SPAWN` | Being spawned |
| `_INIT` | Initializing memory/targets |
| `_GATHER` / `_GATHERM` | Collecting energy / minerals |
| `_DELIVER` / `_DELIVERM` | Delivering energy / minerals |
| `_MINE` | Actively mining |
| `_UPGRADE` | Upgrading controller |
| `_CONSTRUCT` | Building a construction site |
| `_RETURN` | Returning to home room |
| `_CHARGE` | Filling a structure with energy |
| `_ATTACK` | Combat mode |
| `_MOVE` / `_ARRIVED` | Travelling to a target |
| `_DONE` | Task complete, await reassignment |

---

## Memory & Caching

Screeps persists a `Memory` object between ticks, but reading/writing it has CPU cost. This codebase uses a **load-once, write-once** pattern:

- On tick start, data is loaded from `Memory` into `global` (faster access).
- All in-tick updates happen on the `global` copy.
- At tick end, `global` data is serialized back to `Memory`.
- **Empire** state is loaded on tick 1 and saved periodically.
- **Cleaner** prunes dead creep entries and stale rooms every 10 ticks.

### Key Memory Namespaces

```
Memory.creeps[name]      — Per-creep state machine data
Memory.rooms[roomName]   — Per-room config and state flags
Memory.structures[id]    — Per-structure metadata
Memory.empire            — Empire-wide resource request queue
Memory.scienceQueue      — Lab reaction requests
Memory.debugEnabled      — Debug channel toggles
```

---

## Prototype Extensions

Screeps native objects are extended via prototype mixins. All extensions are loaded through `src/prototypes/all.ts`.

| File | What it adds |
|------|-------------|
| `prototypes/creep/basicActions.ts` | Movement, fullness checks, home detection, target clearing |
| `prototypes/creep/energyActions.ts` | Energy pickup/delivery, spawn/tower/storage filling |
| `prototypes/creep/mineralActions.ts` | Mineral gathering, lab filling |
| `prototypes/creep/memory.ts` | Memory utility helpers |
| `prototypes/room.ts` | `init()`, `sourceSetup()`, `mineralSetup()`, `roleSetup()`, lab reactions |
| `prototypes/structureTower.ts` | Defense targeting logic |
| `prototypes/structurelink.ts` | Link energy transfer coordination |
| `prototypes/structureLab.ts` | Reaction management |
| `prototypes/structurespawn.ts` | Spawn-specific helpers |
| `prototypes/source.ts` | Space availability tracking |
| `prototypes/flag.ts` | Flag-based command handling |
| `prototypes/roomposition.ts` | Position utility methods |

---

## Configuration

**`src/config/constants.ts`** — Primary config file:
- `ROLES: string[]` — Role names in spawn priority order
- `ROLEMODELS: typeof Role[]` — Corresponding role class references
- CPU limit constants
- Room-level settings (link limits, charge thresholds, wall/rampart targets)

**`src/config/diplomacy.ts`** — `ALLIES` and `ENEMIES` player name arrays.

**`src/config/states.ts`** — Numeric state machine constants.

---

## Debugging

A custom `Debug` class wraps `console.log` with HTML color formatting for the Screeps in-game console.

**Debug channels:** `general`, `creep`, `room`, `memory`, `spawn`, `tower`, `link`, `lab`

Toggle a channel from the game console:
```javascript
Memory.debugEnabled.spawn = true   // Enable spawn debug output
Memory.debugEnabled.creep = false  // Disable creep debug output
```

Visual overlays use `room.visual` to draw colored circles and text on the map.

**Error mapping:** `src/utils/ErrorMapper.ts` maps runtime errors back to original TypeScript source line numbers using source maps.

---

## Pathfinding

Uses the [**Traveler**](https://github.com/bonzaiferroni/Traveler) library (`src/utils/Traveler.ts`) — a community pathfinding wrapper around `PathFinder.search()` that handles cross-room movement, avoiding obstacles, and caching paths.

Usage: `creep.travelTo(target)` instead of `creep.moveTo(target)`.

---

## Dependency Notes (for modernization)

This codebase is several years old. Key things to address for a new project:

| Dependency | Current | Issue | Recommendation |
|------------|---------|-------|----------------|
| TypeScript | 2.8.3 | Very old | Upgrade to TS 5.x |
| TSLint | 5.11.0 | **Deprecated** | Replace with ESLint + `@typescript-eslint` |
| Rollup | 0.x | Old API | Upgrade to Rollup 4.x |
| Lodash | 3.10.1 | Old; large bundle | Upgrade to 4.x or remove in favor of native ES methods |
| `@types/screeps` | Old | May be out of date | Use latest `screeps-typescript-declarations` |
| Traveler | 0.1.0 | Old | Check for updates; community still maintains it |

**No tests exist.** For a new project, consider adding **Jest + ts-jest** to unit test role logic and state machines without running the actual game.

**Fresh start scaffolding:** The [screeps-typescript-starter](https://github.com/screepers/screeps-typescript-starter) project is the current community-standard scaffolding for new TypeScript Screeps projects and uses a modern toolchain (Webpack or Rollup, ESLint, latest types).

---

## Quick Reference: Key Files

| Task | File |
|------|------|
| Game loop entry point | `src/main.ts` |
| Add/change spawn priority | `src/config/constants.ts` — `ROLES` / `ROLEMODELS` |
| Add a new creep role | `src/roles/` → new file; register in `constants.ts` |
| Change room behavior | `src/prototypes/room.ts` |
| Adjust body compositions | Role file → `bodyStructure[][]` |
| Add a resource request | `src/functions/Empire.ts` — `requestQueue` |
| Modify state transitions | Role file + `src/config/states.ts` |
| Toggle ally/enemy | `src/config/diplomacy.ts` |
