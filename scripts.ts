import Replicate from "replicate";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { globby } from "globby";
import { dirname, basename, extname, join } from "node:path";
import dotenv from "dotenv";

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

async function processAudio(audioFile: string) {
  console.log("processing", audioFile);
  const audio = await readFile(audioFile);

  const input = {
    audio,
    model: "large-v2",
    initial_prompt: "",
    word_timestamps: true,
    compression_ratio_threshold: 2,
  };

  const output = await replicate.run(
    "hnesk/whisper-wordtimestamps:4a60104c44dd709fc08a03dfeca6c6906257633dd03fd58663ec896a4eeba30e",
    { input }
  );
  console.log("transcription: " + output.transcription);

  // save to file
  const narrationFolder = dirname(audioFile).replace("narration", "subtitles");
  const fileNameWithoutExt = basename(audioFile, extname(audioFile));
  const outputFilePath = join(narrationFolder, `${fileNameWithoutExt}.json`);
  await mkdir(narrationFolder, { recursive: true });

  console.log("done, writing to", outputFilePath);

  await writeFile(outputFilePath, JSON.stringify(output, null, 2));
}

async function allAudios() {
  // get all audio files in folder (recursively)
  let audioFiles = await globby("./public/narration/**/*.mp3");
  console.log(audioFiles.length, "audio files found");

  let i = 0;
  for (let audioFile of audioFiles) {
    console.log(i + 1, "of", audioFiles.length);
    await processAudio(audioFile);
    i++;
  }
}

allAudios();
