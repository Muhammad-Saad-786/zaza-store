import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineUpload,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import useSellAccountStore from "../../stores/useSellAccountStore";

export default function ImagesStep() {
  const { formData, addImages, removeImage } = useSellAccountStore();

  const onDrop = useCallback(
    (acceptedFiles) => {
      addImages(acceptedFiles);
    },
    [addImages],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024,
  });

  const imageCount = formData.images.length;
  const needsMore = 5 - imageCount;
  const hasMinimum = imageCount >= 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Upload Screenshots</h2>
          <p className="text-white/40 text-sm mt-1">
            Upload screenshots of your account to prove ownership and details
          </p>
        </div>

        {/* Image Counter Badge */}
        <div
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            hasMinimum
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}
        >
          {hasMinimum ? (
            <HiOutlineCheckCircle className="w-5 h-5" />
          ) : (
            <HiOutlineExclamationCircle className="w-5 h-5" />
          )}
          {imageCount} / 5 images
          {!hasMinimum && (
            <span className="text-xs">({needsMore} more needed)</span>
          )}
        </div>
      </div>

      {/* Warning Message - Shows when less than 5 images */}
      {!hasMinimum && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
        >
          <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 text-sm font-medium">
              Minimum 5 screenshots required
            </p>
            <p className="text-yellow-400/60 text-xs mt-1">
              You need {needsMore} more image{needsMore !== 1 ? "s" : ""}.
              Include: Profile page, Hero list, Skin collection, Rank, and
              Battle history.
            </p>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {hasMinimum && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
        >
          <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-400 text-sm font-medium">
              Minimum requirement met!
            </p>
            <p className="text-green-400/60 text-xs mt-1">
              You can add up to 10 images total. First image will be the cover.
            </p>
          </div>
        </motion.div>
      )}

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-purple-500 bg-purple-500/10"
            : imageCount < 5
              ? "border-yellow-500/30 hover:border-yellow-500/50 bg-yellow-500/[0.02]"
              : "border-white/10 hover:border-purple-500/30 hover:bg-purple-500/[0.02]"
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          className="space-y-3"
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
              isDragActive ? "bg-purple-500/20" : "bg-white/[0.03]"
            }`}
          >
            <HiOutlineUpload
              className={`w-8 h-8 ${
                isDragActive ? "text-purple-400" : "text-white/20"
              }`}
            />
          </div>
          <div>
            <p className="text-white font-medium">
              {isDragActive ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className="text-white/30 text-sm mt-1">or click to browse</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-white/20 text-xs">
            <HiOutlinePhotograph className="w-4 h-4" />
            <span>PNG, JPG, WebP up to 5MB each</span>
          </div>
        </motion.div>
      </div>

      {/* Required Screenshots Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Profile Page", desc: "Your MLBB profile overview" },
          { label: "Hero List", desc: "All owned heroes" },
          { label: "Skin Collection", desc: "Skins gallery" },
          { label: "Current Rank", desc: "Rank & stars" },
          { label: "Battle History", desc: "Recent matches" },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              i < imageCount
                ? "bg-green-500/5 border-green-500/20"
                : "bg-white/[0.01] border-white/5"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                i < imageCount
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/5 text-white/20"
              }`}
            >
              {i < imageCount ? (
                <HiOutlineCheckCircle className="w-4 h-4" />
              ) : (
                <span className="text-xs font-medium">{i + 1}</span>
              )}
            </div>
            <div>
              <p
                className={`text-sm font-medium ${
                  i < imageCount ? "text-green-400" : "text-white/40"
                }`}
              >
                {item.label}
              </p>
              <p className="text-white/20 text-xs">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Grid */}
      {imageCount > 0 && (
        <div>
          <p className="text-sm text-white/40 mb-3">
            Uploaded Images ({imageCount}/10)
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
                      <span className="px-2 py-1 bg-purple-500/90 text-white text-xs rounded-lg font-medium">
                        Cover
                      </span>
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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
