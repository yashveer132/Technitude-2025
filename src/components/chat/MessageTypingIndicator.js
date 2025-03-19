import React from "react";
import { HStack, Box, useColorModeValue } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
`;

const fadeInOut = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

export const MessageTypingIndicator = () => {
  const dotColor = useColorModeValue("gray.400", "gray.500");

  return (
    <HStack spacing={2} p={4} align="center">
      {[...Array(3)].map((_, i) => (
        <Box
          key={i}
          w="8px"
          h="8px"
          bg={dotColor}
          borderRadius="full"
          animation={`${bounce} 1s infinite ${
            i * 0.2
          }s, ${fadeInOut} 1s infinite ${i * 0.3}s`}
          boxShadow="sm"
          transition="all 0.2s"
        />
      ))}
    </HStack>
  );
};
