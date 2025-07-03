import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initializeGA } from "./utils/initialzeGA.js";
initializeGA();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
