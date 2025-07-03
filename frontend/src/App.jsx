import { lazy } from "react";
import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import "./App.css";
import { SunspotLoader } from "react-awesome-loaders";
import { BoxesLoader } from "react-awesome-loaders";

const Home = lazy(() => import("./pages/Home"));
const Room = lazy(() => import("./pages/Room"));

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-transparent">
              <BoxesLoader
                boxColor={"#4ade80"}
                shadowColor={"#999999"}
                desktopSize={"150px"}
                mobileSize={"80px"}
                background={"transparent"}
                text="Connecting ..."
                textColor="#4ade80"
              />{" "}
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
