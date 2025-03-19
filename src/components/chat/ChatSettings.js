import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";

const ChatSettings = ({ isOpen, onClose, settings, updateSettings }) => {
  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={bgColor}>
        <ModalHeader>Chat Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0" flex="1">
                Show Timestamps
              </FormLabel>
              <Switch
                isChecked={settings.showTimestamps}
                onChange={(e) =>
                  updateSettings("showTimestamps", e.target.checked)
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Font Size</FormLabel>
              <Select
                value={settings.fontSize}
                onChange={(e) => updateSettings("fontSize", e.target.value)}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Message Spacing</FormLabel>
              <Slider
                value={settings.messageSpacing}
                onChange={(v) => updateSettings("messageSpacing", v)}
                min={2}
                max={6}
                step={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" mt={1}>
                <Text fontSize="sm">Compact</Text>
                <Text fontSize="sm">Spacious</Text>
              </HStack>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0" flex="1">
                Show Typing Indicator
              </FormLabel>
              <Switch
                isChecked={settings.showTypingIndicator}
                onChange={(e) =>
                  updateSettings("showTypingIndicator", e.target.checked)
                }
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0" flex="1">
                Enable Animations
              </FormLabel>
              <Switch
                isChecked={settings.enableAnimations}
                onChange={(e) =>
                  updateSettings("enableAnimations", e.target.checked)
                }
              />
            </FormControl>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ChatSettings;
