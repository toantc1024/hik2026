// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { MantineProvider, createTheme } from "@mantine/core";
import FooterContent from "./components/Layout/FooterContent.jsx";
import HeaderContent from "./components/Layout/HeaderContent.jsx";

// Create a custom theme based on HCMUTE brand colors
const hcmuteTheme = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  colors: {
    blue: [
      '#E6F3FF',
      '#CCE7FF',
      '#99CFFF',
      '#66B7FF',
      '#339FFF',
      '#0087FF',
      '#0066CC', // Primary shade - HCMUTE blue
      '#004D99',
      '#003366',
      '#001A33',
    ],
    purple: [
      '#F0E6FF',
      '#E1CCFF',
      '#C299FF',
      '#A366FF',
      '#8433FF',
      '#6500FF',
      '#4D00CC', // Deep purple
      '#3300A3',
      '#1A0066',
      '#0D0033',
    ],
    magenta: [
      '#FFE6F7',
      '#FFCCEF',
      '#FF99DF',
      '#FF66CF',
      '#FF33BF',
      '#FF00AF',
      '#E6009E', // Bright magenta for accents
      '#CC008D',
      '#B3007C',
      '#99006B',
    ],
  },
  defaultGradient: {
    from: 'blue.6',
    to: 'purple.6',
    deg: 135,
  },
  components: {
    Button: {
      defaultProps: {
        color: 'blue',
        variant: 'gradient',
        gradient: { from: 'blue.6', to: 'purple.6', deg: 135 },
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
