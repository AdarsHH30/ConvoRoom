import Home from "./pages/Home";
import Room from "./pages/Room";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Test from "./pages/Test";
import { ThemeProvider } from "./components/ui/theme-provider";
import "./App.css";
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}
export default App;
