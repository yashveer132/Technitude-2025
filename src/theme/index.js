import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const colors = {
  brandPrimary: {
    50: "#e3f2fd",
    100: "#bbdefb",
    200: "#90caf9",
    300: "#64b5f6",
    400: "#42a5f5",
    500: "#2196f3",
    600: "#1e88e5",
    700: "#1976d2",
    800: "#1565c0",
    900: "#0d47a1",
  },
  brandSecondary: {
    50: "#e8f5e9",
    100: "#c8e6c9",
    200: "#a5d6a7",
    300: "#81c784",
    400: "#66bb6a",
    500: "#4caf50",
    600: "#43a047",
    700: "#388e3c",
    800: "#2e7d32",
    900: "#1b5e20",
  },
  accent: {
    50: "#fff8e1",
    100: "#ffecb3",
    200: "#ffe082",
    300: "#ffd54f",
    400: "#ffca28",
    500: "#ffc107",
    600: "#ffb300",
    700: "#ffa000",
    800: "#ff8f00",
    900: "#ff6f00",
  },
};

const styles = {
  global: (props) => ({
    body: {
      bg: mode("gray.50", "gray.900")(props),
      transition: "background-color 0.2s ease-in-out",
    },
    "button, a": {
      transition: "all 0.2s ease-in-out",
      _hover: {
        transform: "translateY(-1px)",
        boxShadow: "md",
      },
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "600",
      borderRadius: "lg",
    },
    variants: {
      solid: (props) => ({
        bg:
          props.colorScheme === "brand"
            ? "brandPrimary.500"
            : props.colorScheme === "accent"
            ? "accent.500"
            : undefined,
        _hover: {
          bg:
            props.colorScheme === "brand"
              ? "brandPrimary.600"
              : props.colorScheme === "accent"
              ? "accent.600"
              : undefined,
        },
      }),
      glass: {
        bg: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        borderWidth: "1px",
        borderColor: "rgba(255, 255, 255, 0.2)",
        color: "white",
        _hover: {
          bg: "rgba(255, 255, 255, 0.2)",
        },
      },
      outline: (props) => ({
        borderColor:
          props.colorScheme === "brand" ? "brandPrimary.500" : undefined,
        color: props.colorScheme === "brand" ? "brandPrimary.500" : undefined,
        _hover: {
          bg: props.colorScheme === "brand" ? "brandPrimary.50" : undefined,
        },
      }),
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: "xl",
        overflow: "hidden",
        boxShadow: "lg",
        transition: "all 0.3s ease-in-out",
        _hover: {
          boxShadow: "xl",
          transform: "translateY(-2px)",
        },
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: "700",
    },
  },
};

const theme = extendTheme({
  colors,
  styles,
  components,
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

export default theme;
