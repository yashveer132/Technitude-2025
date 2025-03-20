import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorMode,
  useColorModeValue,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useBreakpointValue,
  Tooltip,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUtensils,
  FaHospital,
  FaMoon,
  FaSun,
  FaBars,
  FaHotel,
} from "react-icons/fa";
import { motion } from "framer-motion";
import UserMenu from "./UserMenu";

const MotionBox = motion(Box);

function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const bgColor = useColorModeValue(
    scrolled ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0)",
    scrolled ? "rgba(26, 32, 44, 0.8)" : "rgba(26, 32, 44, 0)"
  );

  const textColor = useColorModeValue(
    !scrolled && location.pathname === "/" ? "white" : "gray.800",
    "white"
  );

  const boxShadow = scrolled ? "md" : "none";

  const backdropFilter = scrolled ? "blur(10px)" : "none";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <MotionBox
      as="header"
      position="sticky"
      top={0}
      zIndex={100}
      bg={bgColor}
      color={textColor}
      py={3}
      px={{ base: 4, md: 8 }}
      transition="all 0.3s ease-in-out"
      boxShadow={boxShadow}
      backdropFilter={backdropFilter}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      width="100%"
    >
      <Flex justify="space-between" align="center" width="100%">
        <Flex align="center">
          <Heading
            as={RouterLink}
            to="/"
            size="lg"
            fontWeight="bold"
            letterSpacing="tight"
          >
            GenAI
            <Box as="span" color="brandPrimary.500">
              Assistant
            </Box>
          </Heading>
        </Flex>

        {isMobile ? (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Navigation menu"
              icon={<FaBars />}
              variant="ghost"
              colorScheme="brandPrimary"
            />
            <MenuList>
              <MenuItem as={RouterLink} to="/" icon={<Icon as={FaHome} />}>
                Home
              </MenuItem>
              <MenuItem
                as={RouterLink}
                to="/restaurant"
                icon={<Icon as={FaUtensils} />}
              >
                Restaurant
              </MenuItem>
              <MenuItem
                as={RouterLink}
                to="/clinic"
                icon={<Icon as={FaHospital} />}
              >
                Clinic
              </MenuItem>
              <MenuItem
                as={RouterLink}
                to="/hotel"
                icon={<Icon as={FaHotel} />}
              >
                Hotel
              </MenuItem>
              <MenuItem
                onClick={toggleColorMode}
                icon={<Icon as={colorMode === "light" ? FaMoon : FaSun} />}
              >
                {colorMode === "light" ? "Dark Mode" : "Light Mode"}
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <HStack spacing={4}>
            <Button
              as={RouterLink}
              to="/"
              variant={isActive("/") ? "solid" : "ghost"}
              colorScheme="brandPrimary"
              leftIcon={<Icon as={FaHome} />}
            >
              Home
            </Button>
            <Button
              as={RouterLink}
              to="/restaurant"
              variant={isActive("/restaurant") ? "solid" : "ghost"}
              colorScheme="brandPrimary"
              leftIcon={<Icon as={FaUtensils} boxSize={5} />}
              fontSize="lg"
              size="lg"
            >
              Restaurant
            </Button>
            <Button
              as={RouterLink}
              to="/clinic"
              variant={isActive("/clinic") ? "solid" : "ghost"}
              colorScheme="brandPrimary"
              leftIcon={<Icon as={FaHospital} boxSize={5} />}
              fontSize="lg"
              size="lg"
            >
              Clinic
            </Button>
            <Tooltip
              label="Example of extending our system to additional domains"
              hasArrow
              placement="bottom"
              bg="purple.600"
              color="white"
              px={4}
              py={2}
              borderRadius="md"
            >
              <Button
                as={RouterLink}
                to="/hotel"
                variant={isActive("/hotel") ? "solid" : "ghost"}
                colorScheme="brandPrimary"
                leftIcon={<Icon as={FaHotel} boxSize={5} />}
                fontSize="lg"
                size="lg"
              >
                Hotel
              </Button>
            </Tooltip>
            <UserMenu />
            <IconButton
              aria-label={`Switch to ${
                colorMode === "light" ? "dark" : "light"
              } mode`}
              icon={<Icon as={colorMode === "light" ? FaMoon : FaSun} />}
              onClick={toggleColorMode}
              variant="ghost"
              colorScheme="brandPrimary"
            />
          </HStack>
        )}
      </Flex>
    </MotionBox>
  );
}

export default Header;
