import { useQuery } from "@tanstack/react-query";
import { getJobs } from "../api/jobs";

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],

    queryFn: async () => {
      const { data } = await getJobs();

      return data;
    },
  });
}
