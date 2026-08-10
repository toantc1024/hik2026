// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { MantineProvider, createTheme } from "@mantine/core";
import FooterContent from "./components/Layout/FooterContent.jsx";
import HeaderContent from "./components/Layout/HeaderContent.jsx";

// Create a custom theme synchronized with the avatar frame colors
const hcmuteTheme = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  colors: {
    blue: [
      '#F0F6FF',
      '#DCEBFF',
      '#B9D6FF',
      '#8CC0FF',
      '#5FA8FF',
      '#338CFF',
      '#0F4FE6', // Primary electric blue from avatar frame
      '#0B3FB8',
      '#072E8A',
      '#041D5C',
    ],
    red: [
      '#FFF1F1',
      '#FFD8D8',
      '#FFB3B3',
      '#FF8585',
      '#FF5B5B',
      '#FF3434',
      '#E11D2E', // Avatar ribbon red
      '#BF1326',
      '#8F0F1C',
      '#5E0A12',
    ],
    yellow: [
      '#FFF9E6',
      '#FFF0C2',
      '#FFE38F',
      '#FFD65C',
      '#FFCA2B',
      '#F5B800',
      '#D99E00', // Warm gold accent from avatar details
      '#B57F00',
      '#805A00',
      '#4D3500',
    ],
  },
  defaultGradient: {
    from: 'blue.6',
    to: 'red.6',
    deg: 135,
  },
  components: {
    Button: {
      defaultProps: {
        color: 'blue',
        variant: 'gradient',
        gradient: { from: 'blue.6', to: 'red.6', deg: 135 },
      },
    },
    SegmentedControl: {
      defaultProps: {
        color: 'blue',
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <MantineProvider theme={hcmuteTheme} defaultColorScheme="light">
    <HeaderContent />
    <App />
    <FooterContent />
  </MantineProvider>
);
