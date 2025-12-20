import { render } from "@testing-library/react-native";
import { Text } from "react-native";

test("smoke test works", () => {
  const { getByText } = render(<Text>Hello Test</Text>);
  expect(getByText("Hello Test")).toBeTruthy();
});
