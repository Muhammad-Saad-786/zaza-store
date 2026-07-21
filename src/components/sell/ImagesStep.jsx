import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineUpload,
} from "react-icons/hi";
import useSellAccountStore from "../../stores/useSellAccountStore";

export default function ImagesStep() {
  const { formData, addImages, removeImage } = useSellAccountStore();

  const onDrop = useCallback((acceptedFiles) => {
    addImages(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Upload Images</h2>
      <p className="text-white/40 text-sm">
        Add screenshots of your account. First image will be the cover. Max 10
        images, 5MB each.
      </p>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-brand-purple bg-brand-purple/10"
            : "border-glass-border hover:border-brand-purple/50 hover:bg-brand-purple/5"
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          className="space-y-3"
        >
          <HiOutlineUpload className="w-12 h-12 text-brand-purple mx-auto" />
          <div>
            <p className="text-white font-medium">
              {isDragActive ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className="text-white/30 text-sm mt-1">or click to browse</p>
          </div>
          <p className="text-white/20 text-xs">PNG, JPG, WebP up to 5MB</p>
        </motion.div>
      </div>

      {/* Image Preview Grid */}
      {formData.images.length > 0 && (
        <div>
          <p className="text-sm text-white/40 mb-3">
            {formData.images.length}/10 images uploaded
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {formData.images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                  <img
                    src={image.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* First image badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="badge-purple text-xs">Cover</span>
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <HiOutlineX className="w-3 h-3 text-white" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
