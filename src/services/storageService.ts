import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Compresses an image file client-side using Canvas before uploading.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<Blob | File> {
  // If not an image or SVG/GIF, return as-is
  if (!file.type.startsWith('image/') || file.type.includes('svg') || file.type.includes('gif')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a file or blob to base64 Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Firebase Storage with progress tracking.
 * Includes graceful fallback to optimized Data URL if storage bucket rejects.
 */
export async function uploadProductImage(
  file: File,
  productId = 'general',
  onProgress?: (progress: number) => void
): Promise<string> {
  const compressed = await compressImage(file);
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `products/${productId}/${Date.now()}_${cleanFileName}`;

  try {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, compressed, {
      contentType: 'image/jpeg',
    });

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(Math.round(progress));
        },
        async (error) => {
          console.warn('Firebase Storage upload failed, falling back to data URL:', error);
          try {
            const dataUrl = await fileToDataUrl(compressed);
            onProgress?.(100);
            resolve(dataUrl);
          } catch (dataErr) {
            reject(dataErr);
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.(100);
            resolve(downloadUrl);
          } catch (urlErr) {
            const dataUrl = await fileToDataUrl(compressed);
            resolve(dataUrl);
          }
        }
      );
    });
  } catch (err) {
    console.warn('Direct upload error, falling back to data URL:', err);
    return await fileToDataUrl(compressed);
  }
}

/**
 * Deletes an image from Firebase Storage if it's a storage URL.
 */
export async function deleteStorageImage(url: string): Promise<void> {
  if (!url || !url.includes('firebasestorage.googleapis.com')) {
    return;
  }
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Could not delete storage image:', err);
  }
}
