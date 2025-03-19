import { Box, Container, SimpleGrid, Heading } from "@chakra-ui/react";
import DashboardCard from "../components/analytics/DashboardCard";

function DashboardPage() {
  const analyticsData = [
    {
      title: "Total Bookings",
      value: "1,284",
      change: 12.5,
      type: "increase",
    },
    {
      title: "Active Users",
      value: "892",
      change: 8.2,
      type: "increase",
    },
    {
      title: "Customer Satisfaction",
      value: "94%",
      change: 5.1,
      type: "increase",
    },
    {
      title: "Response Rate",
      value: "98.3%",
      change: -2.3,
      type: "decrease",
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Analytics Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {analyticsData.map((data, index) => (
          <DashboardCard key={index} {...data} />
        ))}
      </SimpleGrid>
    </Container>
  );
}

export default DashboardPage;
