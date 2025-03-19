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
} from "react-icons/fa";
import ChatInterface from "../components/chat/ChatInterface";
import { useDomain } from "../context/DomainContext";
import { hotelData } from "../data/hotelData";
import ReviewCard from "../components/reviews/ReviewCard";

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

  const reviews = [
    {
      user: "John Doe",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent stay! The rooms were clean and comfortable.",
      verified: true,
    },
    {
      user: "Jane Smith",
      rating: 4,
      date: "2024-01-10",
      comment: "Great service, but the WiFi was a bit slow.",
      verified: true,
    },
  ];

  return (
    <Box px={{ base: 2, md: 0 }}>
      <Heading
        as="h1"
        mb={{ base: 4, md: 6 }}
        textAlign="center"
        fontSize={{ base: "2xl", md: "3xl" }}
      >
        {hotelData.name}
      </Heading>

      <Text
        textAlign="center"
        mb={{ base: 4, md: 6 }}
        fontSize={{ base: "md", md: "lg" }}
        px={{ base: 2, md: 0 }}
      >
        {hotelData.address} • {hotelData.phone}
      </Text>

      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={{ base: 4, md: 6 }}
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
                  height={{ base: "calc(100vh - 400px)", md: "500px" }}
                  overflowY="auto"
                >
                  {hotelData.rooms?.map((room) => (
                    <Box
                      key={room.id}
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
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Heading as="h3" size="md">
                            {room.type}
                          </Heading>
                          <Text mt={1}>{room.description}</Text>
                        </Box>
                        <Badge
                          colorScheme={room.available ? "green" : "red"}
                          fontSize="0.8em"
                          py={1}
                          px={2}
                        >
                          {room.available ? "Available" : "Booked"}
                        </Badge>
                      </Flex>

                      <HStack mt={3} flexWrap="wrap">
                        {room.amenities.slice(0, 5).map((amenity, idx) => {
                          const IconComponent = getAmenityIcon(amenity);
                          return (
                            <Tag key={idx} size="sm" colorScheme="gray" mb={2}>
                              {IconComponent && (
                                <Icon as={IconComponent} mr={1} />
                              )}
                              {amenity}
                            </Tag>
                          );
                        })}
                        {room.amenities.length > 5 && (
                          <Tag size="sm" colorScheme="gray">
                            +{room.amenities.length - 5} more
                          </Tag>
                        )}
                      </HStack>

                      <Flex justify="space-between" align="center" mt={2}>
                        <HStack>
                          <Icon as={FaUsers} />
                          <Text fontWeight="medium">
                            Capacity: {room.capacity}
                          </Text>
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

                  <Box p={4} borderWidth="1px" borderRadius="lg">
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

              <TabPanel>
                <Box>
                  <Heading size="md" mb={4}>
                    Guest Reviews
                  </Heading>
                  {reviews?.map((review, index) => (
                    <ReviewCard key={index} review={review} />
                  ))}
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
