import { Stack, Text, Button, Divider } from "@mantine/core";

export default function NavbarContent() {
  return (
    <Stack spacing="sm">
      <Text weight={500}>Tools</Text>
      <Divider />
      <Button variant="light" fullWidth>
        Frame Generator
      </Button>
      <Button variant="subtle" fullWidth>
        Templates
      </Button>
      <Button variant="subtle" fullWidth>
        My Designs
      </Button>

      <Text weight={500} mt="xl">
        Settings
      </Text>
      <Divider />
      <Button variant="subtle" fullWidth>
        Preferences
      </Button>
      <Button variant="subtle" fullWidth>
        Help
      </Button>
    </Stack>
  );
}
