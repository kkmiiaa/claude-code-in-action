import { test, expect, vi, afterEach } from "vitest";
import { buildFileManagerTool } from "../file-manager";

afterEach(() => {
  vi.clearAllMocks();
});

function makeMockFs() {
  return {
    rename: vi.fn().mockReturnValue(true),
    deleteFile: vi.fn().mockReturnValue(true),
  };
}

test("rename command calls fileSystem.rename and returns success message", async () => {
  const fs = makeMockFs();
  const tool = buildFileManagerTool(fs as any);

  const result = await tool.execute({
    command: "rename",
    path: "/src/old.tsx",
    new_path: "/src/new.tsx",
  });

  expect(fs.rename).toHaveBeenCalledWith("/src/old.tsx", "/src/new.tsx");
  expect(result).toEqual({
    success: true,
    message: "Successfully renamed /src/old.tsx to /src/new.tsx",
  });
});

test("rename command without new_path returns error without calling fileSystem", async () => {
  const fs = makeMockFs();
  const tool = buildFileManagerTool(fs as any);

  const result = await tool.execute({ command: "rename", path: "/src/old.tsx" });

  expect(fs.rename).not.toHaveBeenCalled();
  expect(result).toEqual({
    success: false,
    error: "new_path is required for rename command",
  });
});

test("rename command returns error when fileSystem.rename returns false", async () => {
  const fs = makeMockFs();
  fs.rename.mockReturnValue(false);
  const tool = buildFileManagerTool(fs as any);

  const result = await tool.execute({
    command: "rename",
    path: "/src/old.tsx",
    new_path: "/src/new.tsx",
  });

  expect(result).toEqual({
    success: false,
    error: "Failed to rename /src/old.tsx to /src/new.tsx",
  });
});

test("delete command calls fileSystem.deleteFile and returns success message", async () => {
  const fs = makeMockFs();
  const tool = buildFileManagerTool(fs as any);

  const result = await tool.execute({ command: "delete", path: "/src/old.tsx" });

  expect(fs.deleteFile).toHaveBeenCalledWith("/src/old.tsx");
  expect(result).toEqual({
    success: true,
    message: "Successfully deleted /src/old.tsx",
  });
});

test("delete command returns error when fileSystem.deleteFile returns false", async () => {
  const fs = makeMockFs();
  fs.deleteFile.mockReturnValue(false);
  const tool = buildFileManagerTool(fs as any);

  const result = await tool.execute({ command: "delete", path: "/src/missing.tsx" });

  expect(result).toEqual({
    success: false,
    error: "Failed to delete /src/missing.tsx",
  });
});
