import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import RootLayout from "./ui/RootLayout";
import DashboardPage from "./ui/pages/mods/DashboardPage";
import ModCardPage from "./ui/pages/mods/ModCardPage";
import SettingsPage from "./ui/pages/SettingsPage";
import AboutPage from "./ui/pages/AboutPage";
import CharactersPage from "./ui/pages/CharactersPage";
import CharacterModsPage from "./ui/pages/CharacterModsPage";
import PresetsPage from "./ui/pages/PresetsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "characters", element: <CharactersPage /> },
      { path: "characters/:charName", element: <CharacterModsPage /> },
      { path: "presets", element: <PresetsPage /> },
      { path: "mods", element: <DashboardPage /> },
      { path: "mods/:modId", element: <ModCardPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "about", element: <AboutPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
