export const searchTableEnum = {
  BOOKS: "books",
  VOLUMES: "volumes",
  CHAPTERS: "chapters",
} as const;

export type SearchTableEnumValue =
  (typeof searchTableEnum)[keyof typeof searchTableEnum];
