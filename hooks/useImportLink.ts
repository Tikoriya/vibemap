import { importFromLink, ImportedSpot } from "@/lib/services/import";
import { useMutation } from "@tanstack/react-query";

export const useImportLink = () => {
  const { mutateAsync, isPending, error, reset } = useMutation<
    ImportedSpot,
    Error,
    string
  >({
    mutationFn: importFromLink,
  });

  return {
    importLink: mutateAsync,
    isImporting: isPending,
    importError: error?.message ?? null,
    resetImport: reset,
  };
};
