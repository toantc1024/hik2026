import { Avatar, Box, Group, Image } from "@mantine/core";
import classes from "../../styles/HeaderContent.module.css";
import LOGO from "../../assets/LOGO.png";

export default function HeaderContent() {
  return (
    <Box pb={0}>
      <header className={classes.header}>
        <Group justify="center" h="100%">
          <Image src={LOGO} alt="LOGO" height={80} />
        </Group>
      </header>
    </Box>
  );
}
