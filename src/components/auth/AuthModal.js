import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Button,
  Input,
  Text,
  useToast,
  Divider,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { handleFirebaseError } from "../../utils/firebaseErrorHandler";

function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, login, loginWithGoogle } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(email, password, displayName);
        toast({
          title: "Account created successfully!",
          status: "success",
          duration: 3000,
        });
      } else {
        await login(email, password);
        toast({
          title: "Logged in successfully!",
          status: "success",
          duration: 3000,
        });
      }
      onClose();
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
      toast({
        title: "Logged in successfully with Google!",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent mx={4}>
        <ModalHeader>
          {mode === "login" ? "Welcome Back!" : "Create Account"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} pb={4}>
              <Button
                w="full"
                onClick={handleGoogleLogin}
                leftIcon={<Icon as={FaGoogle} />}
                colorScheme="red"
                variant="outline"
              >
                Continue with Google
              </Button>

              <Divider />

              {mode === "signup" && (
                <Input
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                colorScheme="brandPrimary"
                w="full"
                isLoading={loading}
              >
                {mode === "login" ? "Log In" : "Sign Up"}
              </Button>
            </VStack>
          </form>

          <HStack justify="center" pb={4}>
            <Text>
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </Text>
            <Button
              variant="link"
              colorScheme="brandPrimary"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Sign Up" : "Log In"}
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AuthModal;
