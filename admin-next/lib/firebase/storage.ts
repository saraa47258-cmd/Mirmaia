import { storage, RESTAURANT_ID } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';

// Helper function to get error message in Arabic
const getErrorMessage = (error: any): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'storage/unauthorized':
        return 'ليس لديك صلاحية لرفع الصور. يرجى التحقق من إعدادات Firebase Storage.';
      case 'storage/canceled':
        return 'تم إلغاء عملية الرفع';
      case 'storage/unknown':
        return 'حدث خطأ غير معروف أثناء رفع الصورة';
      case 'storage/invalid-argument':
        return 'الملف غير صالح. يرجى اختيار صورة صحيحة';
      case 'storage/object-not-found':
        return 'الصورة غير موجودة';
      case 'storage/quota-exceeded':
        return 'تم تجاوز المساحة المتاحة. يرجى حذف بعض الصور القديمة';
      default:
        return `حدث خطأ في رفع الصورة: ${error.message || 'خطأ غير معروف'}`;
    }
  }
  
  if (error instanceof Error) {
    return error.message || 'حدث خطأ في رفع الصورة';
  }
  
  return 'حدث خطأ غير معروف في رفع الصورة';
};

export const uploadProductImage = async (
  file: File,
  productId?: string
): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('لم يتم اختيار ملف');
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('الملف المحدد ليس صورة. يرجى اختيار ملف صورة');
    }
    
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
    }
    
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Validate extension
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!validExtensions.includes(extension)) {
      throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, GIF, أو WEBP');
    }
    
    const fileName = productId 
      ? `${productId}_${timestamp}.${extension}`
      : `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
    
    const path = `products/${RESTAURANT_ID}/${fileName}`;
    const storageRef = ref(storage, path);
    
    console.log('Uploading image to:', path);
    
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload successful, getting download URL...');
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('Error in uploadProductImage:', error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const uploadCategoryImage = async (
  file: File,
  categoryId?: string
): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('لم يتم اختيار ملف');
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('الملف المحدد ليس صورة. يرجى اختيار ملف صورة');
    }
    
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
    }
    
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Validate extension
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!validExtensions.includes(extension)) {
      throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, GIF, أو WEBP');
    }
    
    const fileName = categoryId 
      ? `${categoryId}_${timestamp}.${extension}`
      : `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
    
    const path = `categories/${RESTAURANT_ID}/${fileName}`;
    const storageRef = ref(storage, path);
    
    console.log('Uploading image to:', path);
    
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload successful, getting download URL...');
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('Error in uploadCategoryImage:', error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) {
      console.warn('No image URL provided for deletion');
      return;
    }
    
    // Extract path from URL if it's a full URL
    let imagePath = imageUrl;
    if (imageUrl.includes('/o/')) {
      // Firebase Storage URL format: https://firebasestorage.googleapis.com/v0/b/.../o/path%2Fto%2Fimage?alt=media
      const urlParts = imageUrl.split('/o/');
      if (urlParts.length > 1) {
        const pathPart = urlParts[1].split('?')[0];
        imagePath = decodeURIComponent(pathPart);
      }
    }
    
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
    console.log('Image deleted successfully:', imagePath);
  } catch (error: any) {
    console.error('Error deleting image:', error);
    // Don't throw error for deletion failures - it's not critical
    if (error.code !== 'storage/object-not-found') {
      console.warn('Failed to delete image, but continuing:', error.message);
    }
  }
};





