import { expect, test } from "bun:test";
import { LIBRARY, youtubeId } from "./book-library";

test("every library book has an idea, summary and exactly 3 lessons", () => {
  for (const b of LIBRARY) {
    expect(b.idea.length).toBeGreaterThan(5);
    expect(b.summary.length).toBeGreaterThan(20);
    expect(b.lessons).toHaveLength(3);
  }
  expect(new Set(LIBRARY.map((b) => b.id)).size).toBe(LIBRARY.length);
});

test("extracts YouTube ids and rejects other sites", () => {
  expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  expect(youtubeId("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
});
