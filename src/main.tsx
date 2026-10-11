import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import OperationsDashboard from "./pages/OperationsDashboard";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OperationsDashboard />
  </StrictMode>,
);
