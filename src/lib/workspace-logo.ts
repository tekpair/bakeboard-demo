import { maxLogoDataLength } from './workspace-settings';
export const maxLogoUploadBytes = 5 * 1024 * 1024;
export function validateLogoFile(
  type: string,
  size: number,
  bytes: Uint8Array,
) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(type))
    return 'Choose a PNG, JPEG or WebP image.';
  if (!size || size > maxLogoUploadBytes)
    return 'Choose an image smaller than 5 MB.';
  const matches =
    type === 'image/png'
      ? [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
      : type === 'image/jpeg'
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
          String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return matches
    ? null
    : 'This file does not contain a valid image in the selected format.';
}
// Isolated demo adapter: replace with secure image storage in production.
async function prepareImage(
  file: File,
  maxDimension: number,
  maxDataLength: number,
  imageLabel: string,
): Promise<string> {
  const error = validateLogoFile(
    file.type,
    file.size,
    new Uint8Array(await file.slice(0, 12).arrayBuffer()),
  );
  if (error) throw new Error(error);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 40_000_000
    )
      throw new Error('Choose an image with dimensions under 40 megapixels.');
    const canvas = document.createElement('canvas');
    const ratio = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
    );
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext('2d');
    if (!context)
      throw new Error('Image preview is unavailable. Please try again.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/webp', 0.85);
    if (result.length > maxDataLength)
      throw new Error(
        `This ${imageLabel} is too detailed for demo storage. Please choose a smaller image.`,
      );
    return result;
  } catch (error) {
    if (
      error instanceof Error &&
      [
        'Choose an image',
        'Image preview',
        'This logo',
        'This profile picture',
      ].some((prefix) => error.message.startsWith(prefix))
    )
      throw error;
    throw new Error(
      'This image could not be read. Try another PNG, JPEG or WebP image.',
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function prepareWorkspaceLogo(file: File): Promise<string> {
  return prepareImage(file, 640, maxLogoDataLength, 'logo');
}

export function prepareProfilePhoto(file: File): Promise<string> {
  return prepareImage(file, 256, 150_000, 'profile picture');
}
