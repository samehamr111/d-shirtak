import { useMutation } from "@tanstack/react-query";
import type { DesignDto, SaveDesignInput } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

export function useSaveDesign() {
  return useMutation({
    mutationFn: (input: SaveDesignInput) => api.post<DesignDto>("/designs", input),
  });
}
