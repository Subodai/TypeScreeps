/**
 * Native utility helpers replacing lodash usage throughout the codebase.
 * Screeps provides lodash 3.x globally at runtime, but we avoid it here
 * so that the bundle has no lodash dependency and we use modern ES2020+.
 */

/** Sum all numeric values of a plain-object store/carry record. */
export function sumValues(obj: { [key: string]: number }): number {
    return Object.values(obj).reduce((a, b) => a + b, 0);
}

/** Return the element with the highest score, or undefined for an empty array. */
export function maxBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
    if (arr.length === 0) { return undefined; }
    return arr.reduce((best, cur) => fn(cur) > fn(best) ? cur : best);
}

/** Return the element with the lowest score, or undefined for an empty array. */
export function minBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
    if (arr.length === 0) { return undefined; }
    return arr.reduce((best, cur) => fn(cur) < fn(best) ? cur : best);
}

/** Return a new array sorted ascending by the numeric iteratee. */
export function sortByAsc<T>(arr: T[], fn: (item: T) => number): T[] {
    return arr.slice().sort((a, b) => fn(a) - fn(b));
}

/** Return a new array sorted descending by the numeric iteratee. */
export function sortByDesc<T>(arr: T[], fn: (item: T) => number): T[] {
    return arr.slice().sort((a, b) => fn(b) - fn(a));
}

/** Sum an array by an iteratee. */
export function sumBy<T>(arr: T[], fn: (item: T) => number): number {
    return arr.reduce((acc, item) => acc + fn(item), 0);
}

/**
 * Mutate an array in-place, removing all elements matching the predicate.
 * Returns the removed elements (mirrors lodash _.remove behaviour).
 */
export function removeFrom<T>(arr: T[], predicate: (item: T) => boolean): T[] {
    const removed: T[] = [];
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) {
            removed.push(arr[i]);
            arr.splice(i, 1);
        }
    }
    return removed;
}

/**
 * Count elements by a string-returning key function.
 * Returns a record mapping key → count.
 */
export function countBy<T>(arr: T[], fn: (item: T) => string): Record<string, number> {
    return arr.reduce((acc, item) => {
        const key = fn(item);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}

/**
 * Escape HTML special characters (replaces _.escape from lodash).
 * Used for safe output to the Screeps in-game console.
 */
export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/`/g, "&#96;");
}

/**
 * Integer random in [min, max] inclusive (replaces _.random).
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
