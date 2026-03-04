import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Mock next/image for Vitest to avoid property errors by only destructuring valid <img> props
vi.mock("next/image", () => ({
  __esModule: true,
  // Only destructure props allowed on <img>
  default: (props: React.ComponentProps<"img">) => {
    const { src, alt, ...rest } = props;
    // eslint-disable-next-line next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt} {...rest} />;
  },
}));
