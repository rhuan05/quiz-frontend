import { DashboardProvider } from "../../contexts/dashboard-context";
import DashboardContent from "./dashboard-content";

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
