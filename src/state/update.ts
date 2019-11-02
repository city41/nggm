export function update<T>(obj: T, collection: T[], updates: Partial<T>) {
    return collection.map(o => {
        if (o === obj) {
            return {
                ...obj,
                ...updates
            };
        } else {
            return o;
        }
    });
}
