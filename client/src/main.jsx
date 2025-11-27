import React from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./pages/HomePage";
import "./index.css"; // <-- this must exist

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);
