import { Box, Text } from "@chakra-ui/react";

const AnalyticsCard = ({ title, value }) => {
  return (
    <Box
      border="1px"
      borderColor="gray.200"
      p={4}
      borderRadius="md"
      boxShadow="md"
      bg="white"
      minW="150px"
    >
      <Text fontSize="lg" fontWeight="bold">
        {title}
      </Text>
      <Text fontSize="xl" color="teal.500">
        {value}
      </Text>
    </Box>
  );
};

export default AnalyticsCard;
