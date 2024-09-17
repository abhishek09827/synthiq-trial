import { Box, Text, useColorModeValue } from "@chakra-ui/react";

export default function AnalyticsCard({ title, value, bg, shadow, borderRadius, _hover }) {
  const cardBg = bg || useColorModeValue("white", "gray.700");

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius={borderRadius || "lg"}
      shadow={shadow || "lg"}
      _hover={_hover || { transform: "scale(1.05)", transition: "all 0.3s ease-in-out" }}
      transition="transform 0.3s"
      textAlign="center"
      border="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.600")}
    >
      <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
        {title}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" color="teal.500">
        {value}
      </Text>
    </Box>
  );
}
