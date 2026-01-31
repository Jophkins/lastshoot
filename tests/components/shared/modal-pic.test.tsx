import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ModalPic from "../../../components/shared/modal-pic";

describe("modal pic", () => {
  const picture = {
    id: "pic-1",
    url: "https://picsum.photos/id/1/800/1200",
    alt: "Sample picture",
  };

  it("renders the picture and text content", () => {
    render(<ModalPic onClose={vi.fn()} picture={picture} />);

    expect(screen.getByRole("img", { name: /sample picture/i })).toBeInTheDocument();
    expect(screen.getByText(/lorem ipsum/i)).toBeInTheDocument();
  });

  it("invokes onClose when escape is pressed", () => {
    const onClose = vi.fn();
    render(<ModalPic onClose={onClose} picture={picture} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when the overlay is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(<ModalPic onClose={onClose} picture={picture} />);

    fireEvent.click(container.firstChild as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
