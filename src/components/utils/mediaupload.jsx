import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(url, key);

/**
 * Image එකක් උපරිම Quality සහිතව WebP format එකට convert කරන helper function එක
 */
const convertToWebP = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // මුල් image එකේම resolution එක පාවිච්චි කිරීම (Best Quality සඳහා)
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext("2d");
        
        // Image smoothing settings උපරිම කිරීම
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // Quality එක 1.0 (100%) ලෙස WebP වලට convert කිරීම
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // අලුත් File object එකක් සාදා ගැනීම (.webp extension එක සහිතව)
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: "image/webp",
              });
              resolve(webpFile);
            } else {
              reject("WebP Conversion Failed");
            }
          },
          "image/webp",
          1.0 // උපරිම quality එක (Best Quality)
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * @param {File} file - Upload karana file eka
 * @param {string} bucketName - (Optional) Bucket eke nama. Default eka "images"
 */
export default async function uploadMediaToSupabase(file, bucketName = "images") {
  return new Promise(async (resolve, reject) => {
    // 1. File eka nathnam check karanna
    if (!file) {
      return reject("File not added");
    }

    try {
      // Image එකක් නම් පමණක් convert කරන්න (උදා: JPG, PNG, etc)
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        fileToUpload = await convertToWebP(file);
      }

      // 2. Unique file name ekak hadaganna (.webp extension එක සහිතව)
      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // 3. Adala bucket ekata upload kireema
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/webp",
        });

      if (error) throw error;

      // 4. Public URL eka laba ganeema
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      resolve(urlData.publicUrl);
    } catch (err) {
      console.error("Supabase Error:", err.message || err);
      reject(err.message || err);
    }
  });
}