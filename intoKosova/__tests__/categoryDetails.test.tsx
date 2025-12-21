import React from "react";
import { render } from "@testing-library/react-native";
import CategoryDetails from "@/app/(modals)/categoryDetails";

// ================= MOCKS =================

// expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "1" }),
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// reanimated (i domosdoshëm)
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

// SafeAreaView
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: any) => <>{children}</>,
  };
});

// Icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

// ================= TESTS =================

describe("CategoryDetails", () => {
  // 1 SNAPSHOT TEST
  it("matches snapshot for initial render", () => {
    const { toJSON } = render(<CategoryDetails />);
    expect(toJSON()).toMatchSnapshot();
  });

  // 2 TITLE TEST
  it("renders correct category title", () => {
    const { getByText } = render(<CategoryDetails />);
    expect(getByText("Historical Sites")).toBeTruthy();
  });

  // 3 ITEMS TEST
  it("renders all items for selected category", () => {
    const { getByText } = render(<CategoryDetails />);

    expect(getByText("Graçanica Monastery")).toBeTruthy();
    expect(getByText("Deçan Monastery")).toBeTruthy();
    expect(getByText("Patriarchate of Peja")).toBeTruthy();
  });
});
