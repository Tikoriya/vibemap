import { importFromImage, ImportedSpot } from "@/lib/services/import";
import { useMutation } from "@tanstack/react-query";

type ImportImageInput = { image: string; mimeType?: string };

export const useImportImage = () => {
  const { mutateAsync, isPending, error, reset } = useMutation<
    ImportedSpot,
    Error,
    ImportImageInput
  >({
    mutationFn: ({ image, mimeType }) => importFromImage(image, mimeType),
  });

  return {
    importImage: mutateAsync,
    isImporting: isPending,
    importError: error?.message ?? null,
    resetImport: reset,
  };
};
