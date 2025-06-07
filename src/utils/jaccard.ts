export function jaccard(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 && setB.size === 0) return 1;

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
}