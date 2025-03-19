import React from "react";
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
} from "@chakra-ui/react";

const DashboardCard = ({
  title,
  value,
  change,
  type = "increase",
  period = "since last month",
}) => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      p={5}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
    >
      <Stat>
        <StatLabel fontSize="md" fontWeight="medium">
          {title}
        </StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold">
          {value}
        </StatNumber>
        <StatHelpText>
          <StatArrow type={type} />
          {change}% {period}
        </StatHelpText>
      </Stat>
    </Box>
  );
};

export default DashboardCard;
