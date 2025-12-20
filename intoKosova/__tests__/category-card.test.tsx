import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CategoryCard from "@/components/category-card";

/* ================= MOCKS ================= */

// Mock expo-router
const pushMock = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    setParams: jest.fn(),
  }),
}));

// Mock IconSymbol (expo-symbols issue)
jest.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: () => null,
}));

// Disable animations
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

/* ========================================= */

// Mock styles (CategoryCard i merr si props)
const mockStyles = {
  categoryCard: {},
  categoryContent: {},
  categoryHeader: {},
  categoryIcon: {},
  categoryTextContainer: {},
  categoryTitle: {},
  categoryDescription: {},
  categoryItems: {},
  categoryItem: {},
};

// Mock palette
const mockPalette = {
  primary: "#1e90ff",
  lightBlue: "#cce5ff",
  nature: "#2ecc71",
};

describe("CategoryCard – Snapshot tests", () => {
  it("renders category card with up to 2 items", () => {
    const cat = {
      id: 1,
      title: "Nature",
      description: "Beautiful places",
      icon: "leaf",
      colorKey: "nature",
      items: [{ name: "Mountains" }, { name: "Rivers" }],
    };

    const tree = render(
      <CategoryCard
        cat={cat}
        index={0}
        styles={mockStyles}
        palette={mockPalette}
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("renders +X more when category has more than 2 items", () => {
    const cat = {
      id: 2,
      title: "Culture",
      description: "Traditions and heritage",
      icon: "building",
      colorKey: "nature",
      items: [
        { name: "Museums" },
        { name: "Festivals" },
        { name: "Monuments" },
        { name: "Food" },
      ],
    };

    const tree = render(
      <CategoryCard
        cat={cat}
        index={1}
        styles={mockStyles}
        palette={mockPalette}
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("renders correctly when pressed", () => {
    const cat = {
      id: 3,
      title: "History",
      description: "Historic places",
      icon: "clock",
      colorKey: "nature",
      items: [{ name: "Castles" }],
    };

    const screen = render(
      <CategoryCard
        cat={cat}
        index={2}
        styles={mockStyles}
        palette={mockPalette}
      />
    );

    fireEvent.press(screen.getByText("History"));

    expect(screen.toJSON()).toMatchSnapshot();
  });
});
