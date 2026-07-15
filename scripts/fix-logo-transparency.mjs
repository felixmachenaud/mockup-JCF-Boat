import sharp from "sharp";

/**
 * Build a clean white logo on fully transparent background from logo_black.jpeg.
 * Black pixels → solid white (opaque). Light pixels → fully transparent.
 */
async function buildCleanWhiteLogo() {
  const source = "public/logo_black.jpeg";
  const output = "public/logo_white.png";
  const outputAlt = "public/logo_transparent.png";

  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const out = Buffer.alloc(width * height * 4);

  // Threshold: dark pixels are logo ink, light pixels are background / cutouts
  const LOGO_THRESHOLD = 210;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    if (luminance < LOGO_THRESHOLD) {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = 255;
    } else {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
    }
  }

  const png = await sharp(out, {
    raw: { width, height, channels: 4 },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  await sharp(png).toFile(output);
  await sharp(png).toFile(outputAlt);

  // Stats
  let transparent = 0;
  let opaque = 0;
  let partial = 0;
  let grayOpaque = 0;

  for (let i = 0; i < out.length; i += 4) {
    const a = out[i + 3];
    const r = out[i];
    if (a === 0) transparent++;
    else if (a === 255) {
      opaque++;
      if (r < 250) grayOpaque++;
    } else partial++;
  }

  console.log(`Saved ${output} and ${outputAlt}`);
  console.log(`${width}x${height}`);
  console.log(`Transparent: ${transparent}`);
  console.log(`Opaque white: ${opaque}`);
  console.log(`Partial alpha: ${partial}`);
  console.log(`Non-white opaque: ${grayOpaque}`);
}

buildCleanWhiteLogo().catch((err) => {
  console.error(err);
  process.exit(1);
});
