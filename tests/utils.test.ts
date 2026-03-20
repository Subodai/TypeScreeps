import { sumValues, maxBy, minBy, sortByAsc, sortByDesc, sumBy, removeFrom, countBy, escapeHtml, randomInt } from "../src/utils/utils";

describe("sumValues", () => {
    it("sums object values", () => {
        expect(sumValues({ energy: 100, keanite: 50 })).toBe(150);
    });
    it("returns 0 for empty object", () => {
        expect(sumValues({})).toBe(0);
    });
});

describe("maxBy", () => {
    it("returns element with highest score", () => {
        const items = [{ v: 1 }, { v: 3 }, { v: 2 }];
        expect(maxBy(items, x => x.v)).toEqual({ v: 3 });
    });
    it("returns undefined for empty array", () => {
        expect(maxBy([], x => x)).toBeUndefined();
    });
});

describe("minBy", () => {
    it("returns element with lowest score", () => {
        const items = [{ v: 3 }, { v: 1 }, { v: 2 }];
        expect(minBy(items, x => x.v)).toEqual({ v: 1 });
    });
    it("returns undefined for empty array", () => {
        expect(minBy([], x => x)).toBeUndefined();
    });
});

describe("sortByAsc", () => {
    it("does not mutate original", () => {
        const arr = [3, 1, 2];
        const result = sortByAsc(arr, x => x);
        expect(arr).toEqual([3, 1, 2]);
        expect(result).toEqual([1, 2, 3]);
    });
});

describe("sortByDesc", () => {
    it("sorts descending", () => {
        const arr = [1, 3, 2];
        expect(sortByDesc(arr, x => x)).toEqual([3, 2, 1]);
    });
});

describe("sumBy", () => {
    it("sums by iteratee", () => {
        expect(sumBy([{ n: 1 }, { n: 2 }, { n: 3 }], x => x.n)).toBe(6);
    });
});

describe("removeFrom", () => {
    it("mutates array and returns removed elements", () => {
        const arr = [1, 2, 3, 4, 5];
        const removed = removeFrom(arr, x => x % 2 === 0);
        expect(arr).toEqual([1, 3, 5]);
        expect(removed).toEqual([4, 2]);
    });
});

describe("countBy", () => {
    it("counts by key function", () => {
        const result = countBy(["a", "b", "a", "c", "b", "a"], x => x);
        expect(result).toEqual({ a: 3, b: 2, c: 1 });
    });
});

describe("escapeHtml", () => {
    it("escapes HTML special chars", () => {
        expect(escapeHtml("<script>alert('xss')</script>")).toBe(
            "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"
        );
    });
});

describe("randomInt", () => {
    it("returns a number within range", () => {
        for (let i = 0; i < 100; i++) {
            const n = randomInt(1, 5);
            expect(n).toBeGreaterThanOrEqual(1);
            expect(n).toBeLessThanOrEqual(5);
        }
    });
});
