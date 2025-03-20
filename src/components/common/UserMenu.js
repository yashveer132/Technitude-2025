import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  useDisclosure,
  Text,
  VStack,
  HStack,
  AvatarBadge,
  Box,
  Icon,
  useColorModeValue,
  useBreakpointValue,
  IconButton,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../auth/AuthModal";

const MotionBox = motion(Box);

function UserMenu() {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const menuBg = useColorModeValue("white", "gray.800");
  const menuHoverBg = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColorSecondary = useColorModeValue("gray.600", "gray.400");
  const isMobile = useBreakpointValue({ base: true, md: false });

  const menuListProps = {
    mt: 2,
    p: 2,
    bg: menuBg,
    border: "1px solid",
    borderColor: borderColor,
    boxShadow: "lg",
    borderRadius: "xl",
    minW: "250px",
  };

  const menuItemProps = {
    borderRadius: "lg",
    p: 3,
    _hover: { bg: menuHoverBg },
    transition: "all 0.2s",
  };

  return (
    <>
      {user ? (
        <Menu placement="bottom-end" closeOnSelect={false}>
          <MenuButton
            as={Button}
            variant="ghost"
            rounded="full"
            p={1}
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "whiteAlpha.300" }}
          >
            <Avatar
              size={isMobile ? "xs" : "sm"}
              name={user.displayName || user.email}
              src={user.photoURL}
            >
              <AvatarBadge boxSize="1.15em" bg="green.500" />
            </Avatar>
          </MenuButton>
          <MenuList {...menuListProps}>
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <VStack align="stretch" spacing={3}>
                <Box p={2}>
                  <VStack align="center" spacing={2} width="100%">
                    <Avatar
                      size={isMobile ? "md" : "lg"}
                      name={user.displayName || user.email}
                      src={user.photoURL}
                    >
                      <AvatarBadge boxSize="1.25em" bg="green.500" />
                    </Avatar>
                    <VStack spacing={1} textAlign="center" width="100%">
                      <Text fontWeight="bold" fontSize={isMobile ? "md" : "lg"}>
                        {user.displayName || "User"}
                      </Text>
                      <Text fontSize="sm" color={textColorSecondary}>
                        {user.email}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>

                <MenuItem
                  {...menuItemProps}
                  onClick={logout}
                  color="red.400"
                  _hover={{ bg: "red.50", color: "red.500" }}
                  justifyContent="center"
                  display="flex"
                >
                  <Icon as={FaSignOutAlt} mr={2} />
                  <Text>Sign Out</Text>
                </MenuItem>
              </VStack>
            </MotionBox>
          </MenuList>
        </Menu>
      ) : (
        <HStack spacing={2}>
          {isMobile ? (
            <IconButton
              icon={<FaUser />}
              variant="ghost"
              colorScheme="brandPrimary"
              onClick={onOpen}
              aria-label="Sign in"
              _hover={{ bg: "whiteAlpha.200" }}
            />
          ) : (
            <>
              <Button
                variant="ghost"
                colorScheme="brandPrimary"
                onClick={onOpen}
                fontSize="sm"
                fontWeight="medium"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Sign In
              </Button>
              <Button
                colorScheme="brandPrimary"
                onClick={onOpen}
                fontSize="sm"
                fontWeight="medium"
                px={6}
                _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
              >
                Get Started
              </Button>
            </>
          )}
        </HStack>
      )}
      <AuthModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}

export default UserMenu;
