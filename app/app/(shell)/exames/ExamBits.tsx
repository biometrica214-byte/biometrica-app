import { IconBiomarkers, IconFile, IconImage, IconOverview } from "@/components/icons";
import type { ExamStatus } from "@/lib/database.types";
import { STATUS_LABEL } from "@/lib/exams";
import styles from "./exams.module.css";

export function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "laboratory":
      return <IconBiomarkers />;
    case "imaging":
      return <IconImage />;
    case "checkup":
      return <IconOverview />;
    default:
      return <IconFile />;
  }
}

export function StatusBadge({ status }: { status: ExamStatus }) {
  return (
    <span className={styles.status} data-status={status}>
      {STATUS_LABEL[status]}
    </span>
  );
}
