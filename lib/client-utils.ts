"use client"

// This file contains client-side only utilities that use browser APIs

/**
 * Converts a HEIC file to JPEG format
 * @param file The HEIC file to convert
 * @returns A Promise that resolves to a File object containing the converted JPEG
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    console.log(`Starting HEIC conversion for: ${file.name}`)

    // Dynamically import heic2any only on the client side
    const heic2any = (await import("heic2any")).default

    // Convert HEIC to JPEG using heic2any
    const jpegBlob = (await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    })) as Blob

    // Verify the conversion worked
    if (!jpegBlob || jpegBlob.size === 0) {
      throw new Error("Conversion failed: Empty result")
    }

    // Create a new File object from the converted Blob
    const newFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg")
    const convertedFile = new File([jpegBlob], newFileName, { type: "image/jpeg" })

    console.log(`Successfully converted ${file.name} to JPEG (${convertedFile.size} bytes)`)

    return convertedFile
  } catch (error) {
    console.error("HEIC conversion failed:", error)
    throw new Error(`Failed to convert HEIC file: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Checks if a file is a HEIC file by examining its content and extension
 * @param file The file to check
 * @returns A Promise that resolves to true if the file is a HEIC file
 */
export async function isHeicFile(file: File): Promise<boolean> {
  // Check by file extension first (most reliable method)
  if (file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif")) {
    console.log(`File ${file.name} identified as HEIC by extension`)
    return true
  }

  // Check by MIME type
  if (file.type === "image/heic" || file.type === "image/heif") {
    console.log(`File ${file.name} identified as HEIC by MIME type: ${file.type}`)
    return true
  }

  // If neither check works, try to read the file header
  try {
    const buffer = await file.arrayBuffer()
    const view = new Uint8Array(buffer, 0, 12)
    const signature = Array.from(view.slice(4, 8))
      .map((byte) => String.fromCharCode(byte))
      .join("")

    const isHeic =
      signature === "ftyp" &&
      Array.from(view.slice(8, 12))
        .map((byte) => String.fromCharCode(byte))
        .join("")
        .includes("heic")

    console.log(`File ${file.name} header check result: ${isHeic ? "HEIC" : "not HEIC"}`)
    return isHeic
  } catch (error) {
    console.error("Error checking file header:", error)
    // Fall back to extension check on error
    return file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif")
  }
}

