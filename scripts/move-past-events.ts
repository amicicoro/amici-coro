import { promises as fs } from "fs"
import path from "path"

async function movePastEvents() {
  try {
    // Define directories
    const pastEventsDir = path.join(process.cwd(), "data/past-events")
    const eventsDir = path.join(process.cwd(), "data/events")

    // Ensure the events directory exists
    await fs.mkdir(eventsDir, { recursive: true })
    console.log("✓ Ensured events directory exists")

    // Get list of past event files
    const pastEventFiles = await fs.readdir(pastEventsDir)
    console.log(`Found ${pastEventFiles.length} past event files to move`)

    // Move each file
    for (const file of pastEventFiles) {
      const sourcePath = path.join(pastEventsDir, file)
      const destPath = path.join(eventsDir, file)

      // Read the file content
      const content = await fs.readFile(sourcePath, "utf8")

      // Write to the destination
      await fs.writeFile(destPath, content, "utf8")

      // Delete the original file
      await fs.unlink(sourcePath)

      console.log(`✓ Moved: ${file}`)
    }

    console.log("\nAll files have been moved successfully!")
  } catch (error) {
    console.error("Error moving files:", error)
  }
}

movePastEvents()

