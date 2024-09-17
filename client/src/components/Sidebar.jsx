// src/components/Sidebar.js
import { Box, VStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";

const Sidebar = () => {
  return (
    <Box as="nav" w="250px" p={4} bg="gray.100" h="100vh">
      <VStack align="start">
        <Link as={NextLink} href="/dashboard">Dashboard</Link>
        <Link as={NextLink} href="/reports">Reports</Link>
        <Link as={NextLink} href="/settings">Settings</Link>
      </VStack>
    </Box>
  );
};

export default Sidebar;
