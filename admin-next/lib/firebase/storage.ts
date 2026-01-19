import { storage, RESTAURANT_ID } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadProductImage = async (
  file: File,
  productId?: string
): Promise<string> => {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = productId 
    ? `${productId}_${timestamp}.${extension}`
    : `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
  
  const path = `products/${RESTAURANT_ID}/${fileName}`;
  const storageRef = ref(storage, path);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};

export const uploadCategoryImage = async (
  file: File,
  categoryId?: string
): Promise<string> => {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = categoryId 
    ? `${categoryId}_${timestamp}.${extension}`
    : `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
  
  const path = `categories/${RESTAURANT_ID}/${fileName}`;
  const storageRef = ref(storage, path);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};





