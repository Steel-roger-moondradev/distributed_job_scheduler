import { useQuery } from "@tanstack/react-query";
import { getFailedJobs } from "../api/job.js";
export function useFailedJobs() {
    return useQuery({
        queryKey: ["failedJobs"],
        queryFn: async () => {
            const { data } = await getFailedJobs();
            return data;
        },
        staleTime: 0,
        refetchInterval: 5000,
    });
}
