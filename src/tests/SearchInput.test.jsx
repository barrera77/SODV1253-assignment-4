import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchInput from "../components/SearchInput";
import { fetchData } from "../services/api-client";
import { describe, expect, it, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../services/api-client", () => ({
  fetchData: vi.fn(),
}));

const mockedFetchData = vi.mocked(fetchData);

describe("SearchInput Component", () => {
  const mockData = [
    { city: "Toronto", temperature: "25°C", weather: "Sunny" },
    { city: "Vancouver", temperature: "18°C", weather: "Rainy" },
  ];

  beforeEach(() => {
    mockedFetchData.mockResolvedValue(mockData);
  });

  it("renders input and search button", () => {
    render(<SearchInput />);
    expect(
      screen.getByPlaceholderText("Enter location ...")
    ).toBeInTheDocument();
    expect(screen.getByText(/search/i)).toBeInTheDocument();
  });

  it("fetches and displays data on search", async () => {
    render(<SearchInput />);
    const input = screen.getByPlaceholderText("Enter location ...");
    const button = screen.getByText(/search/i);

    fireEvent.change(input, { target: { value: "Toronto" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Toronto")).toBeInTheDocument();
      expect(screen.getByText("25°C")).toBeInTheDocument();
      expect(screen.getByText("Sunny")).toBeInTheDocument();
    });
  });

  it("displays all data when location input is empty", async () => {
    render(<SearchInput />);
    const button = screen.getByText(/search/i);

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Toronto")).toBeInTheDocument();
      expect(screen.getByText("Vancouver")).toBeInTheDocument();
    });
  });

  it("displays error message when city not found", async () => {
    mockedFetchData.mockResolvedValue(mockData);

    render(<SearchInput />);
    const input = screen.getByPlaceholderText("Enter location ...");
    const button = screen.getByText(/search/i);

    fireEvent.change(input, { target: { value: "Unknown City" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("City not found")).toBeInTheDocument();
    });
  });

  it("displays loading spinner during fetch", async () => {
    render(<SearchInput />);
    const button = screen.getByText(/search/i);

    fireEvent.click(button);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument()
    );
  });

  it("handles fetchData failure", async () => {
    mockedFetchData.mockRejectedValue(new Error("Failed to fetch data"));

    render(<SearchInput />);
    const button = screen.getByText(/search/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
    });
  });
});
