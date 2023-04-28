import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { indigo } from "@mui/material/colors";
import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider
      theme={createTheme({
        palette: {
          primary: indigo,
          secondary: indigo,
        },
      })}
    >
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
