// src/components/utils/imgDataURLtoFile.ts
// This utility is useful for converting base64 data URLs back to File objects.
// This is used when a user selects an image and we store it as a data URL for preview
// before converting it back to a File for FormData submission.
// However, as discussed, we'll try to minimize re-converting existing URLs.

const imgDataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'; // Default to jpeg if mime not found
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export default imgDataURLtoFile;

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
