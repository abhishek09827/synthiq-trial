// src/components/Header.js
import { Box, Heading } from "@chakra-ui/react";

const Header = () => {
  return (
    <Box as="header" bg="teal.500" color="white" p={4}>
      <Heading size="lg">Analytics Dashboard</Heading>
    </Box>
  );
};

export default Header;
