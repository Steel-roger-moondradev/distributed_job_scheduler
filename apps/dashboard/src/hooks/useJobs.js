import { useQuery } from "@tanstack/react-query";
import { getJobs } from "../api/job.js";
export function useJobs() {
    return useQuery({
        queryKey: ["jobs"],
        queryFn: async () => {
            const { data } = await getJobs();
            return data;
        },
        staleTime: 0,
        refetchInterval: 5000,
    });
}
