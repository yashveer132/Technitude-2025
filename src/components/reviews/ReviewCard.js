import React from "react";
import {
  Box,
  Flex,
  Text,
  Avatar,
  Badge,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaStar, FaCheckCircle } from "react-icons/fa";

const ReviewCard = ({ review }) => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="sm"
      mb={4}
    >
      <Flex align="center" mb={2}>
        <Avatar size="sm" name={review.user} mr={2} />
        <Box flex="1">
          <Flex align="center">
            <Text fontWeight="bold">{review.user}</Text>
            {review.verified && (
              <Icon as={FaCheckCircle} color="green.500" ml={1} />
            )}
          </Flex>
          <Flex align="center">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <Icon
                  key={i}
                  as={FaStar}
                  color={i < review.rating ? "yellow.400" : "gray.300"}
                />
              ))}
          </Flex>
        </Box>
        <Badge colorScheme="green" fontSize="xs">
          {new Date(review.date).toLocaleDateString()}
        </Badge>
      </Flex>
      <Text mt={2}>{review.comment}</Text>
    </Box>
  );
};

export default ReviewCard;
