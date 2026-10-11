import { Header } from "../components/layout/Header";
import { OperationsDashboardContent } from "../components/operations/OperationsDashboardContent";

export default function OperationsDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 md:p-6 lg:p-8">
        <OperationsDashboardContent />
      </main>
    </div>
  );
}