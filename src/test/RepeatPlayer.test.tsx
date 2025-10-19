import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepeatPlayer from "../RepeatPlayer";

describe("RepeatPlayer", () => {
  test("renders and show initial prompt with play disabled", () => {
    render(<RepeatPlayer />);
    expect(screen.getByText(/Select an MP4 to begin/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Play N times/i })
    ).toBeDisabled();
  });
});

function makeFile(name = "sample.mp4", type = "video/mp4", size = 1000) {
  const blob = new Blob(["x".repeat(size)], { type });
  return new File([blob], name, { type });
}

test("selects a file, enables Play, shows video and filename", async () => {
  const user = userEvent.setup();
  const { container } = render(<RepeatPlayer />);

  // file input should exist
  const fileInput = container.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;
  expect(fileInput).toBeInTheDocument();

  // upload a mock mp4
  const file = makeFile();
  await user.upload(fileInput, file);

  const playBtn = await screen.getByRole("button", { name: /Play N times/i });

  // wait until React has updated state and re-rendered
  await waitFor(() => expect(playBtn).toBeEnabled());

  // Play is enabled
  expect(screen.getByRole("button", { name: /Play N times/i })).toBeEnabled();

  // video is present and uses blob URL
  const video = container.querySelector("video") as HTMLVideoElement;
  expect(video).toBeInTheDocument();
  expect(video.src).toContain("blob:mock-url");

  // filename text appears
  expect(screen.getByText(/Selected:/i)).toHaveTextContent("sample.mp4");
});
