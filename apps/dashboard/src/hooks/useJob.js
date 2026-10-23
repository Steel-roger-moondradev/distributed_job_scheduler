import { useQuery } from "@tanstack/react-query";
import { getJob } from "../api/job.js";
export function useJob(id) {
    return useQuery({
        queryKey: ["job", id],
        queryFn: async () => {
            const { data } = await getJob(id);
            return data;
        },
        enabled: !!id,
        staleTime: 0,
        refetchInterval: 5000,
    });
}
