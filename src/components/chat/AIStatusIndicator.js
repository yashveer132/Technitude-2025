import React from "react";
import { Badge, Tooltip, Icon, HStack, Text } from "@chakra-ui/react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

const AIStatusIndicator = ({ apiStatus, showDetails = false }) => {
  let status = "online";

  if (apiStatus === false) {
    status = "offline";
  } else if (apiStatus === "limited") {
    status = "limited";
  }

  const statusConfig = {
    online: {
      color: "green",
      icon: FaCheckCircle,
      text: "Online",
      description: "AI service is fully operational",
    },
    limited: {
      color: "yellow",
      icon: FaExclamationTriangle,
      text: "Limited",
      description: "AI service is available with reduced functionality",
    },
    offline: {
      color: "red",
      icon: FaExclamationTriangle,
      text: "Offline",
      description:
        "AI service is currently unavailable, using fallback responses",
    },
  };

  const config = statusConfig[status];

  return (
    <Tooltip label={config.description} hasArrow>
      <HStack spacing={1}>
        {showDetails && <Icon as={config.icon} color={`${config.color}.500`} />}
        <Badge
          colorScheme={config.color}
          variant="solid"
          borderRadius="full"
          px={2}
        >
          {config.text}
        </Badge>
      </HStack>
    </Tooltip>
  );
};

export default AIStatusIndicator;
