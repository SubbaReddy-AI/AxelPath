import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";

import { ThemeProvider } from "./context/ThemeContext";

import { AuthProvider } from "./context/AuthContext";

import PageLoader from "./components/common/PageLoader";


function App() {
  return (
    <BrowserRouter>

      <ThemeProvider>

        <AuthProvider>

          {/* AxelPath Opening Animation */}
          <PageLoader />

          {/* Website Routes */}
          <AppRoutes />

        </AuthProvider>

      </ThemeProvider>

    </BrowserRouter>
  );
}

export default App;