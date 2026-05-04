const fs = require("fs");
const path = require("path");
const dir = "public/audio/A1";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".mp3"));

const tracks = files.map(file => {
  const match = file.match(/^X_\[(\d+)-(\d+)\]_(.+)\.mp3$/);
  if (!match) return null;
  const lesson = parseInt(match[1], 10);
  const session = parseInt(match[2], 10);
  const name = match[3];
  
  return {
    id: `A1_L${lesson}_S${session}_${name}`,
    filename: file,
    title: `Lesson ${lesson} - ${name}`,
    lesson,
    session,
    bookId: "A1",
    uri: `/audio/A1/${file}`,
    durationMs: 0
  };
}).filter(Boolean);

tracks.sort((a, b) => {
  if (a.lesson !== b.lesson) return a.lesson - b.lesson;
  return a.session - b.session;
});

const fileContent = `import type { AudioTrack } from "../types";\n\nexport const a1Tracks: AudioTrack[] = ${JSON.stringify(tracks, null, 2)};\n`;
fs.writeFileSync("src/data/a1Tracks.ts", fileContent);
console.log("Generated src/data/a1Tracks.ts with " + tracks.length + " tracks.");
