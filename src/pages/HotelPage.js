import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Text,
  Badge,
  SimpleGrid,
  HStack,
  Icon,
  Tag,
  VStack,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaBed,
  FaBell,
  FaInfoCircle,
  FaWifi,
  FaTv,
  FaSnowflake,
  FaGlassMartini,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import ChatInterface from "../components/chat/ChatInterface";
import { useDomain } from "../context/DomainContext";
import { hotelData } from "../data/hotelData";
import { parseMarkdown } from "../utils/markdownParser";

function HotelPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { switchDomain } = useDomain();
  const accentColor = useColorModeValue("accent.500", "accent.300");
  const packageBgColor = useColorModeValue(
    "accent.50",
    "rgba(255, 193, 7, 0.1)"
  );

  useEffect(() => {
    switchDomain("hotel");
  }, [switchDomain]);

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi")) return FaWifi;
    if (amenityLower.includes("tv")) return FaTv;
    if (amenityLower.includes("air")) return FaSnowflake;
    if (amenityLower.includes("bar")) return FaGlassMartini;
    return null;
  };

  const renderMessageContent = (text) => {
    if (!text) return <Text>No message content</Text>;

    const cleanedText = text.replace(/\n{3,}/g, "\n\n");

    const textWithBoldPackages = cleanedText.replace(
      /(Romance Package|Business Package|Family Fun Package|Wellness Retreat)/g,
      "**$1**"
    );

    const textWithSpacing = textWithBoldPackages.replace(/\n\*/g, "\n\n*");

    if (
      textWithSpacing.includes("**") ||
      textWithSpacing.includes("*") ||
      textWithSpacing.includes("#") ||
      textWithSpacing.includes("- ") ||
      textWithSpacing.includes("`") ||
      textWithSpacing.includes("```") ||
      textWithSpacing.includes("|") ||
      textWithSpacing.includes("\n\n") ||
      textWithSpacing.includes("> ")
    ) {
      return parseMarkdown(textWithSpacing);
    }

    return (
      <Text whiteSpace="pre-wrap" wordBreak="break-word">
        {textWithSpacing}
      </Text>
    );
  };

  return (
    <Box px={{ base: 0, md: 4 }} py={{ base: 2, md: 8 }}>
      <Heading
        as="h1"
        mb={{ base: 3, md: 6 }}
        textAlign="center"
        fontSize={{ base: "xl", md: "3xl" }}
        px={2}
      >
        {hotelData.name}
      </Heading>

      <Text
        textAlign="center"
        mb={{ base: 4, md: 6 }}
        fontSize={{ base: "md", md: "lg" }}
        px={{ base: 2, md: 0 }}
      >
        {hotelData.address} {hotelData.phone}
      </Text>

      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={{ base: 2, md: 6 }}
      >
        <GridItem>
          <Tabs variant="enclosed" onChange={(index) => setSelectedTab(index)}>
            <TabList
              justifyContent="center"
              width="100%"
              borderBottom="none"
              overflowX={{ base: "auto", md: "visible" }}
              flexWrap={{ base: "nowrap", md: "wrap" }}
              sx={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Tab minW="150px">
                <HStack justify="center">
                  <Icon as={FaBed} />
                  <Text>Rooms</Text>
                </HStack>
              </Tab>
              <Tab minW="150px">
                <HStack justify="center">
                  <Icon as={FaBell} />
                  <Text>Services</Text>
                </HStack>
              </Tab>
              <Tab minW="150px">
                <HStack justify="center">
                  <Icon as={FaInfoCircle} />
                  <Text>Policies</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={{ base: 2, md: 4 }}>
                <Box
                  height={{ base: "calc(100vh - 280px)", md: "500px" }}
                  overflowY="auto"
                >
                  {hotelData.rooms?.map((room) => (
                    <Box
                      key={room.id}
                      p={6}
                      mb={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      boxShadow="sm"
                      transition="all 0.2s"
                      _hover={{
                        boxShadow: "lg",
                        transform: "translateY(-2px)",
                      }}
                    >
                      <Flex justify="space-between" align="start">
                        <Box flex="1">
                          <Heading as="h3" size="md" mb={2}>
                            {room.type}
                          </Heading>
                          <Text mt={1} color="gray.600" fontSize="md">
                            {room.description}
                          </Text>
                        </Box>
                        <Badge
                          colorScheme={room.availability ? "green" : "red"}
                          fontSize="0.9em"
                          px={2}
                          py={1}
                          borderRadius="full"
                          ml={4}
                        >
                          {room.availability ? "Available" : "Booked"}
                        </Badge>
                      </Flex>

                      <Grid
                        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                        gap={4}
                        mt={4}
                      >
                        <Box>
                          <Text fontWeight="semibold" mb={2}>
                            Amenities:
                          </Text>
                          <HStack flexWrap="wrap" spacing={2}>
                            {room.amenities.map((amenity, idx) => {
                              const IconComponent = getAmenityIcon(amenity);
                              return (
                                <Tag
                                  key={idx}
                                  size="md"
                                  colorScheme="gray"
                                  mb={2}
                                  py={1}
                                >
                                  {IconComponent && (
                                    <Icon as={IconComponent} mr={1} />
                                  )}
                                  {amenity}
                                </Tag>
                              );
                            })}
                          </HStack>
                        </Box>
                        <Box>
                          <Text fontWeight="semibold" mb={2}>
                            Features:
                          </Text>
                          <VStack align="start" spacing={1}>
                            {room.features.map((feature, idx) => (
                              <HStack key={idx}>
                                <Icon as={FaCheckCircle} color="green.500" />
                                <Text>{feature}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      </Grid>

                      <Flex
                        justify="space-between"
                        align="center"
                        mt={4}
                        pt={4}
                        borderTopWidth="1px"
                      >
                        <HStack spacing={4}>
                          <HStack>
                            <Icon as={FaUsers} color="gray.500" />
                            <Text fontWeight="medium">
                              Max Occupancy: {room.maxOccupancy}
                            </Text>
                          </HStack>
                        </HStack>
                        <Text fontWeight="bold" color={accentColor}>
                          ${room.rate}/night
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </Box>
              </TabPanel>

              <TabPanel>
                <Box height="500px" overflowY="auto">
                  <Heading as="h3" size="md" mb={4}>
                    Hotel Services
                  </Heading>
                  {hotelData.services?.map((service) => (
                    <Box
                      key={service.id}
                      p={4}
                      mb={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      boxShadow="sm"
                      transition="all 0.2s"
                      _hover={{
                        boxShadow: "md",
                        transform: "translateY(-2px)",
                      }}
                    >
                      <Heading as="h4" size="md">
                        {service.name}
                      </Heading>
                      <Text mt={2}>{service.description}</Text>
                      <Flex mt={3} justify="space-between">
                        <Text fontSize="sm">Hours: {service.hours}</Text>
                        <Text fontWeight="medium">{service.cost}</Text>
                      </Flex>
                    </Box>
                  ))}

                  <Heading as="h3" size="md" mt={6} mb={4}>
                    Special Packages
                  </Heading>
                  {hotelData.packages?.map((pkg) => (
                    <Box
                      key={pkg.id}
                      p={4}
                      mb={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      boxShadow="sm"
                      bg={packageBgColor}
                      transition="all 0.2s"
                      _hover={{
                        boxShadow: "md",
                        transform: "translateY(-2px)",
                      }}
                    >
                      <Heading as="h4" size="md">
                        {pkg.name}
                      </Heading>
                      <Text mt={2}>{pkg.description}</Text>
                      <VStack align="start" mt={3} spacing={1}>
                        {pkg.includes.map((item, idx) => (
                          <Text key={idx}>• {item}</Text>
                        ))}
                      </VStack>
                      <Flex mt={3} justify="space-between" align="center">
                        <Badge colorScheme="green">
                          Save {pkg.discount * 100}%
                        </Badge>
                        <Text fontWeight="bold" color={accentColor}>
                          ${pkg.price}
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </Box>
              </TabPanel>

              <TabPanel>
                <Box height="500px" overflowY="auto">
                  <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                    <Heading as="h3" size="md" mb={2}>
                      Check-in/Check-out
                    </Heading>
                    <Text>
                      <strong>Check-in:</strong>{" "}
                      {hotelData.policies.checkInTime}
                    </Text>
                    <Text>
                      <strong>Check-out:</strong>{" "}
                      {hotelData.policies.checkOutTime}
                    </Text>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                    <Heading as="h3" size="md" mb={2}>
                      Cancellation Policy
                    </Heading>
                    <Text>{hotelData.policies.cancellation}</Text>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                    <Heading as="h3" size="md" mb={2}>
                      Hotel Rules
                    </Heading>
                    <Text>
                      <strong>Pets:</strong>{" "}
                      {hotelData.policies.petsAllowed
                        ? "Allowed"
                        : "Not allowed"}
                    </Text>
                    <Text>
                      <strong>Smoking:</strong>{" "}
                      {hotelData.policies.smokingAllowed
                        ? "Allowed in designated areas"
                        : "Not allowed"}
                    </Text>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                    <Heading as="h3" size="md" mb={2}>
                      Payment Options
                    </Heading>
                    <Box pl={4}>
                      {hotelData.policies?.paymentOptions?.map(
                        (option, idx) => (
                          <Text key={idx}>• {option}</Text>
                        )
                      )}
                    </Box>
                  </Box>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>

        <GridItem>
          <Box p={{ base: 2, md: 4 }} borderWidth="1px" borderRadius="lg">
            <ChatInterface context="hotel" domainData={hotelData} />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default HotelPage;
