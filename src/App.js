import { ChakraProvider, Container, Box, useToast } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import ClinicPage from "./pages/ClinicPage";
import HotelPage from "./pages/HotelPage";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import theme from "./theme";
import { auth } from "./firebase/config";
import { DomainProvider } from "./context/DomainContext";
import { getApiStatus } from "./services/chatService";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ServiceProvider } from "./context/ServiceContext";
import { SettingsProvider } from "./context/SettingsContext";

function App() {
  const toast = useToast();

  useEffect(() => {
    const checkConfigurations = async () => {
      if (!auth) {
        console.error("Firebase Auth not initialized");
        toast({
          title: "Firebase Auth Error",
          description: "Authentication service not available",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        return;
      }

      try {
        await auth.app.name;
      } catch (error) {
        console.error("Firebase Auth error:", error);
        toast({
          title: "Firebase Auth Error",
          description: error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }

      const apiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY;
      if (!apiKey) {
        console.error("Google AI API key not found in environment variables");
        toast({
          title: "Google AI API Key Missing",
          description: "Please check your environment variables configuration",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } else {
        const apiStatus = getApiStatus();
        if (apiStatus === "offline") {
          toast({
            title: "AI Service Unavailable",
            description: "Running in offline mode with limited functionality",
            status: "warning",
            duration: 9000,
            isClosable: true,
          });
        }
      }
    };

    const handleOnline = async () => {
      toast({
        title: "Back Online",
        description: "App is now connected",
        status: "info",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      toast({
        title: "Offline Mode",
        description: "Some features may be limited",
        status: "warning",
        duration: 3000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    checkConfigurations();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <ServiceProvider>
          <SettingsProvider>
            <AuthProvider>
              <DomainProvider>
                <Box as="div" className="app-fonts">
                  <Router>
                    <Box
                      className="App"
                      minH="100vh"
                      display="flex"
                      flexDirection="column"
                    >
                      <Header />
                      <Container maxW="container.xl" flex="1" py={8}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route
                            path="/restaurant"
                            element={<RestaurantPage />}
                          />
                          <Route path="/clinic" element={<ClinicPage />} />
                          <Route path="/hotel" element={<HotelPage />} />
                        </Routes>
                      </Container>
                      <Footer />
                    </Box>
                  </Router>
                </Box>
              </DomainProvider>
            </AuthProvider>
          </SettingsProvider>
        </ServiceProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;
