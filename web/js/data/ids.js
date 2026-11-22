// A level's id is made from its name. Stars are saved by id, so levels can move without losing them.
export const levelId = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
