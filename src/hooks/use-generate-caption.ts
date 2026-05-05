import { useState } from "react";
import { toast } from "sonner";
import { aiApi } from "../services/api-services";

export const useGenerateCaption = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async (imageUrls: string[]): Promise<string[] | null> => {
    if (!imageUrls.length) return null;
    setIsGenerating(true);
    try {
      return await aiApi.generateCaption(imageUrls);
    } catch {
      toast.error("Không thể tạo caption. Thử lại sau.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating };
};
