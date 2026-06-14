export async function stripImageMetadata(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());

  if (isJpeg(bytes)) {
    return new Blob([stripJpegMetadata(bytes)], { type: "image/jpeg" });
  }

  if (isPng(bytes)) {
    return new Blob([stripPngMetadata(bytes)], { type: "image/png" });
  }

  if (isWebp(bytes)) {
    return new Blob([stripWebpMetadata(bytes)], { type: "image/webp" });
  }

  throw new Error(
    "Only JPEG, PNG, and WebP images are supported because upload metadata must be stripped.",
  );
}

function isJpeg(bytes: Uint8Array) {
  return bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

function stripJpegMetadata(bytes: Uint8Array) {
  const parts = [bytes.slice(0, 2)];
  let offset = 2;
  let sawStartOfScan = false;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      throw new Error("Invalid JPEG upload.");
    }

    const markerStart = offset;

    while (offset < bytes.length && bytes[offset] === 0xff) {
      offset += 1;
    }

    if (offset >= bytes.length) {
      break;
    }

    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xda) {
      sawStartOfScan = true;
      parts.push(bytes.slice(markerStart));
      break;
    }

    if (marker === 0xd9) {
      throw new Error("Invalid JPEG upload.");
    }

    if (isStandaloneJpegMarker(marker)) {
      parts.push(bytes.slice(markerStart, offset));
      continue;
    }

    if (offset + 2 > bytes.length) {
      throw new Error("Invalid JPEG upload.");
    }

    const segmentLength = readUint16BE(bytes, offset);
    const segmentEnd = offset + segmentLength;

    if (segmentLength < 2 || segmentEnd > bytes.length) {
      throw new Error("Invalid JPEG upload.");
    }

    if (!isJpegMetadataMarker(marker)) {
      parts.push(bytes.slice(markerStart, segmentEnd));
    }

    offset = segmentEnd;
  }

  if (!sawStartOfScan) {
    throw new Error("Invalid JPEG upload.");
  }

  return concatBytes(parts);
}

function isStandaloneJpegMarker(marker: number) {
  return marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7);
}

function isJpegMetadataMarker(marker: number) {
  return marker === 0xfe || (marker >= 0xe1 && marker <= 0xef && marker !== 0xee);
}

function isPng(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function stripPngMetadata(bytes: Uint8Array) {
  const parts = [bytes.slice(0, 8)];
  let offset = 8;
  let sawImageEnd = false;

  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) {
      throw new Error("Invalid PNG upload.");
    }

    const length = readUint32BE(bytes, offset);
    const chunkStart = offset;
    const chunkType = readAscii(bytes, offset + 4, 4);
    const chunkEnd = offset + 12 + length;

    if (chunkEnd > bytes.length) {
      throw new Error("Invalid PNG upload.");
    }

    if (shouldKeepPngChunk(chunkType)) {
      parts.push(bytes.slice(chunkStart, chunkEnd));
    }

    offset = chunkEnd;

    if (chunkType === "IEND") {
      sawImageEnd = true;
      break;
    }
  }

  if (!sawImageEnd) {
    throw new Error("Invalid PNG upload.");
  }

  return concatBytes(parts);
}

function shouldKeepPngChunk(chunkType: string) {
  const firstByte = chunkType.charCodeAt(0);
  const isCriticalChunk = firstByte >= 0x41 && firstByte <= 0x5a;

  return (
    isCriticalChunk ||
    chunkType === "tRNS" ||
    chunkType === "sRGB" ||
    chunkType === "gAMA" ||
    chunkType === "cHRM"
  );
}

function isWebp(bytes: Uint8Array) {
  return (
    bytes.length >= 12 &&
    readAscii(bytes, 0, 4) === "RIFF" &&
    readAscii(bytes, 8, 4) === "WEBP"
  );
}

function stripWebpMetadata(bytes: Uint8Array) {
  const parts: Uint8Array[] = [];
  let offset = 12;

  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) {
      throw new Error("Invalid WebP upload.");
    }

    const chunkStart = offset;
    const chunkType = readAscii(bytes, offset, 4);
    const chunkSize = readUint32LE(bytes, offset + 4);
    const chunkEnd = offset + 8 + chunkSize + (chunkSize % 2);

    if (chunkEnd > bytes.length) {
      throw new Error("Invalid WebP upload.");
    }

    if (chunkType !== "EXIF" && chunkType !== "XMP ") {
      const chunk = bytes.slice(chunkStart, chunkEnd);
      parts.push(chunkType === "VP8X" ? clearWebpMetadataFlags(chunk) : chunk);
    }

    offset = chunkEnd;
  }

  const bodySize = 4 + parts.reduce((sum, part) => sum + part.length, 0);
  const header = new Uint8Array(12);
  writeAscii(header, 0, "RIFF");
  writeUint32LE(header, 4, bodySize);
  writeAscii(header, 8, "WEBP");

  return concatBytes([header, ...parts]);
}

function clearWebpMetadataFlags(chunk: Uint8Array) {
  const output = chunk.slice();

  if (output.length >= 9) {
    output[8] = output[8] & ~0x0c;
  }

  return output;
}

function concatBytes(parts: Uint8Array[]) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function writeAscii(bytes: Uint8Array, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    bytes[offset + index] = value.charCodeAt(index);
  }
}

function readUint16BE(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUint32BE(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] * 0x1000000 +
    ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3])
  );
}

function readUint32LE(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    bytes[offset + 3] * 0x1000000
  );
}

function writeUint32LE(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
  bytes[offset + 3] = Math.floor(value / 0x1000000) & 0xff;
}
