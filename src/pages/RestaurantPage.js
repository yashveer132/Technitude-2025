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
  Tag,
  TagLeftIcon,
  HStack,
  Badge,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import {
  FaUtensils,
  FaLeaf,
  FaBreadSlice,
  FaListUl,
  FaInfoCircle,
} from "react-icons/fa";
import ChatInterface from "../components/chat/ChatInterface";
import { useDomain } from "../context/DomainContext";
import { restaurantData } from "../data/restaurantData";

function RestaurantPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { switchDomain } = useDomain();
  const accentColor = useColorModeValue("brandPrimary.500", "brandPrimary.300");

  useEffect(() => {
    switchDomain("restaurant");
  }, [switchDomain]);

  return (
    <Box px={{ base: 0, md: 4 }} py={{ base: 2, md: 8 }}>
      <Heading
        as="h1"
        mb={{ base: 3, md: 6 }}
        textAlign="center"
        fontSize={{ base: "xl", md: "3xl" }}
        px={2}
      >
        {restaurantData.name}
      </Heading>

      <Text
        textAlign="center"
        mb={{ base: 3, md: 6 }}
        fontSize={{ base: "sm", md: "lg" }}
        px={2}
      >
        Hours: {restaurantData.openHours} • {restaurantData.cuisineType} Cuisine
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
                  <Icon as={FaUtensils} />
                  <Text>Menu</Text>
                </HStack>
              </Tab>
              <Tab minW="150px">
                <HStack justify="center">
                  <Icon as={FaListUl} />
                  <Text>Combos</Text>
                </HStack>
              </Tab>
              <Tab minW="150px">
                <HStack justify="center">
                  <Icon as={FaInfoCircle} />
                  <Text>Info</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={{ base: 2, md: 4 }}>
                <Box
                  height={{ base: "calc(100vh - 400px)", md: "500px" }}
                  overflowY="auto"
                >
                  {restaurantData.menu.map((item) => (
                    <Box
                      key={item.id}
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
                      <Heading as="h3" size="md">
                        {item.name}
                      </Heading>
                      <Text mt={2}>{item.description}</Text>
                      <Text mt={2} fontWeight="bold" color={accentColor}>
                        ${item.price.toFixed(2)}
                      </Text>
                      <HStack mt={2} spacing={2}>
                        {item.isVegetarian && (
                          <Tag colorScheme="green" size="sm">
                            <TagLeftIcon as={FaLeaf} />
                            Vegetarian
                          </Tag>
                        )}
                        {item.isGlutenFree && (
                          <Tag colorScheme="purple" size="sm">
                            <TagLeftIcon as={FaBreadSlice} />
                            Gluten-free
                          </Tag>
                        )}
                      </HStack>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Preparation time: {item.preparationTime} minutes
                      </Text>
                    </Box>
                  ))}
                </Box>
              </TabPanel>

              <TabPanel>
                <Box height="500px" overflowY="auto">
                  {restaurantData.combos.map((combo) => {
                    const comboItems = combo.items.map((itemId) =>
                      restaurantData.menu.find((m) => m.id === itemId)
                    );

                    return (
                      <Box
                        key={combo.id}
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
                        <Heading as="h3" size="md">
                          {combo.name}
                        </Heading>
                        <Text mt={2}>{combo.description}</Text>
                        <Text mt={2} fontWeight="bold">
                          ${combo.price.toFixed(2)}
                          <Badge colorScheme="green" ml={2}>
                            Save {(combo.discount * 100).toFixed(0)}%
                          </Badge>
                        </Text>
                        <Text mt={2} fontWeight="medium">
                          Includes:
                        </Text>
                        <Box pl={4}>
                          {comboItems.map((item) => (
                            <Text key={item.id}>• {item.name}</Text>
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </TabPanel>

              <TabPanel>
                <Box height="500px" overflowY="auto">
                  <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                    <Heading as="h3" size="md" mb={2}>
                      Delivery Information
                    </Heading>
                    <Text>
                      Delivery Fee: $
                      {restaurantData.orderInformation.deliveryFee.toFixed(2)}
                    </Text>
                    <Text>
                      Free Delivery on orders over $
                      {restaurantData.orderInformation.minimumOrderForFreeDelivery.toFixed(
                        2
                      )}
                    </Text>
                    <Text>
                      Average preparation time:{" "}
                      {restaurantData.orderInformation.averagePreparationTime}{" "}
                      minutes
                    </Text>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="lg">
                    <Heading as="h3" size="md" mb={2}>
                      Payment Options
                    </Heading>
                    <Box pl={4}>
                      {restaurantData.orderInformation.paymentOptions.map(
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
            <ChatInterface context="restaurant" domainData={restaurantData} />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default RestaurantPage;
