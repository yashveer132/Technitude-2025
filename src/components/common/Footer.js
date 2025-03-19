import {
  Box,
  Container,
  Text,
  Flex,
  HStack,
  Icon,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaGithub, FaReact, FaRobot, FaHeart } from "react-icons/fa";

function Footer() {
  const bgColor = useColorModeValue("brandPrimary.600", "gray.800");
  const borderColor = useColorModeValue("brandPrimary.700", "gray.700");

  return (
    <Box
      as="footer"
      py={4}
      bg={bgColor}
      color="white"
      borderTopWidth="4px"
      borderStyle="solid"
      borderTopColor={borderColor}
    >
      <Container maxW="container.xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          textAlign={{ base: "center", md: "left" }}
        >
          <Box mb={{ base: 4, md: 0 }}>
            <Text fontSize="lg" fontWeight="bold" mb={1}>
              <Icon as={FaRobot} mr={2} />
              GenAI Assistant
            </Text>
            <Text fontSize="sm" opacity={0.8}>
              A versatile AI solution adaptable for multiple domains
            </Text>
          </Box>

          <HStack spacing={4} fontSize="sm">
            <Text opacity={0.8}>
              Made with <Icon as={FaHeart} color="red.400" mx={1} /> for
              Hackathon
            </Text>
            <Text opacity={0.8}>
              <Icon as={FaReact} mr={1} /> Powered by React & OpenAI
            </Text>
            <Link
              href="https://github.com"
              isExternal
              display="flex"
              alignItems="center"
              fontWeight="medium"
            >
              <Icon as={FaGithub} mr={1} /> Source
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default Footer;
