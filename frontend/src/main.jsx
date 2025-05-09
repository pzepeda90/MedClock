import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { UserProvider } from "./providers/UserProvider";
import { ProcedimientosProvider } from "./providers/ProcedimientosProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ProcedimientosProvider>
          <App />
        </ProcedimientosProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
