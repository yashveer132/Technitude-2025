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
  Flex,
  useColorModeValue,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { FaUserMd, FaCalendarCheck, FaClipboardList } from "react-icons/fa";
import ChatInterface from "../components/chat/ChatInterface";
import { clinicData } from "../data/clinicData";
import { useDomain } from "../context/DomainContext";

function ClinicPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { switchDomain } = useDomain();
  const accentColor = useColorModeValue(
    "brandSecondary.500",
    "brandSecondary.300"
  );

  useEffect(() => {
    switchDomain("clinic");
  }, [switchDomain]);

  const getWeekdayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <Box px={{ base: 2, md: 0 }}>
      <Heading
        as="h1"
        mb={{ base: 4, md: 6 }}
        textAlign="center"
        fontSize={{ base: "2xl", md: "3xl" }}
      >
        {clinicData.name}
      </Heading>

      <Text
        textAlign="center"
        mb={{ base: 4, md: 6 }}
        fontSize={{ base: "md", md: "lg" }}
      >
        {clinicData.address} • {clinicData.phone}
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
                  <Icon as={FaUserMd} />
                  <Text>Doctors</Text>
                </HStack>
              </Tab>
              <Tab minW="150px">
                <HStack justify="center">
                  <Icon as={FaCalendarCheck} />
                  <Text>Services</Text>
                </HStack>
              </Tab>
              <Tab minW="150px">
                <HStack justify="center">
                  <Icon as={FaClipboardList} />
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
                  {clinicData.doctors.map((doctor) => (
                    <Box
                      key={doctor.id}
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
                            Dr. {doctor.name}
                          </Heading>
                          <Text mt={1} fontWeight="medium" color={accentColor}>
                            {doctor.specialty}
                          </Text>
                          <Text fontSize="sm" mt={1}>
                            {doctor.qualifications}
                          </Text>
                        </Box>
                        <Badge
                          colorScheme={doctor.available ? "green" : "red"}
                          fontSize="0.8em"
                          py={1}
                          px={2}
                        >
                          {doctor.available ? "Available" : "Not Available"}
                        </Badge>
                      </Flex>

                      <Box mt={4}>
                        <Text fontWeight="medium">Schedule:</Text>
                        <SimpleGrid
                          columns={{ base: 1, sm: 2 }}
                          spacing={{ base: 2, md: 4 }}
                          mt={2}
                        >
                          {Object.entries(doctor.schedule).map(
                            ([day, times]) => (
                              <Box key={day}>
                                <Text fontWeight="bold">
                                  {getWeekdayName(day)}
                                </Text>
                                {times.length > 0 ? (
                                  times.map((time, idx) => (
                                    <Text key={idx} fontSize="sm">
                                      {time}
                                    </Text>
                                  ))
                                ) : (
                                  <Text fontSize="sm" color="gray.500">
                                    Closed
                                  </Text>
                                )}
                              </Box>
                            )
                          )}
                        </SimpleGrid>
                      </Box>

                      <Text mt={4} fontWeight="bold" color={accentColor}>
                        Consultation Fee: ${doctor.consultationFee}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </TabPanel>

              <TabPanel>
                <Box height="500px" overflowY="auto">
                  {clinicData.services.map((service) => (
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
                      <Heading as="h3" size="md">
                        {service.name}
                      </Heading>
                      <Text mt={2}>{service.description}</Text>
                      <Text mt={2} fontWeight="bold" color={accentColor}>
                        Fee: ${service.fee}
                      </Text>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Duration: {service.duration} minutes
                      </Text>
                    </Box>
                  ))}
                </Box>
              </TabPanel>

              <TabPanel>
                <Box height="500px" overflowY="auto">
                  <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                    <Heading as="h3" size="md" mb={2}>
                      Appointment Policies
                    </Heading>
                    <Text mb={1}>
                      <strong>Cancellation Policy:</strong> Please cancel at
                      least {clinicData.appointmentPolicy.cancellationNotice}{" "}
                      hours in advance
                    </Text>
                    <Text mb={1}>
                      <strong>Late Arrival:</strong>{" "}
                      {clinicData.appointmentPolicy.lateArrival}
                    </Text>
                    <Text>
                      <strong>No-Show Policy:</strong>{" "}
                      {clinicData.appointmentPolicy.noShow}
                    </Text>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="lg">
                    <Heading as="h3" size="md" mb={2}>
                      Accepted Insurance Plans
                    </Heading>
                    <Box pl={4}>
                      {clinicData.insuranceAccepted.map((insurance, idx) => (
                        <Text key={idx}>• {insurance}</Text>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>

        <GridItem>
          <Box p={{ base: 2, md: 4 }} borderWidth="1px" borderRadius="lg">
            <ChatInterface context="clinic" domainData={clinicData} />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default ClinicPage;
