export const sanitize = (name: string) =>
    name
        .toLowerCase()
        .replace(/\s+/g, "")        // remove spaces
        .replace(/[^a-z0-9]/g, ""); // remove punctuation
