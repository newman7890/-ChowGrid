import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Storage Service for uploading images to Supabase Storage
 */
export const StorageService = {
  /**
   * Upload an image file to a Supabase bucket and return public URL
   */
  async uploadImage(
    bucket: 'dishes' | 'store-logos' | 'avatars' | 'kyc-documents',
    file: File,
    customPath?: string
  ): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured. Using local object URL as preview fallback.');
      return URL.createObjectURL(file);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = customPath || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error(`Error uploading to ${bucket}:`, err);
      return null;
    }
  },
};
