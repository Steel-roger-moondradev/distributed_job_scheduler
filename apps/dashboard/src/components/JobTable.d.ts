import { Job } from "../type/job.js";
interface Props {
    jobs: Job[];
    onView: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
    onDelete: (id: string) => void;
}
export default function JobTable({ jobs, onView, onPause, onResume, onDelete, }: Props): import("react").JSX.Element;
export {};
//# sourceMappingURL=JobTable.d.ts.map