import { test, expect, vi, afterEach } from "vitest";
import { buildStrReplaceTool } from "../str-replace";

afterEach(() => {
  vi.clearAllMocks();
});

function makeMockFs() {
  return {
    viewFile: vi.fn().mockReturnValue("file content"),
    createFileWithParents: vi.fn().mockReturnValue("Created /path/to/file"),
    replaceInFile: vi.fn().mockReturnValue("Replaced 1 occurrence"),
    insertInFile: vi.fn().mockReturnValue("Inserted text at line 3"),
  };
}

test("view command calls fileSystem.viewFile with path", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs as any);

  const result = await tool.execute({ command: "view", path: "/src/App.tsx" });

  expect(fs.viewFile).toHaveBeenCalledOnce();
  expect(fs.viewFile).toHaveBeenCalledWith("/src/App.tsx", undefined);
  expect(result).toBe("file content");
});

test("view command passes view_range to fileSystem.viewFile", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs as any);

  await tool.execute({ command: "view", path: "/src/App.tsx", view_range: [1, 10] });

  expect(fs.viewFile).toHaveBeenCalledWith("/src/App.tsx", [1, 10]);
});

test("create command calls fileSystem.createFileWithParents with path and file_text", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs as any);

  const result = await tool.execute({
    command: "create",
    path: "/src/NewFile.tsx",
    file_text: "export default function App() {}",
  });

  expect(fs.createFileWithParents).toHaveBeenCalledWith(
    "/src/NewFile.tsx",
    "export default function App() {}"
  );
  expect(result).toBe("Created /path/to/file");
});

test("create command defaults to empty string when file_text is omitted", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs as any);

  await tool.execute({ command: "create", path: "/src/Empty.tsx" });

  expect(fs.createFileWithParents).toHaveBeenCalledWith("/src/Empty.tsx", "");
});

test("str_replace command calls fileSystem.replaceInFile with path, old_str, new_str", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs as any);

  const result = await tool.execute({
    command: "str_replace",
    path: "/src/App.tsx",
    old_str: "const x = 1",
    new_str: "const x = 2",
  });

  expect(fs.replaceInFile).toHaveBeenCalledWith(
    "/src/App.tsx",
    "const x = 1",
    "const x = 2"
  );
  expect(result).toBe("Replaced 1 occurrence");
});

test("str_replace defaults old_str and new_str to empty string when omitted", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs as any);

  await tool.execute({ command: "str_replace", path: "/src/App.tsx" });

  expect(fs.replaceInFile).toHaveBeenCalledWith("/src/App.tsx", "", "");
});

test("insert command calls fileSystem.insertInFile with path, insert_line, new_str", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs as any);

  const result = await tool.execute({
    command: "insert",
    path: "/src/App.tsx",
    insert_line: 3,
    new_str: "// inserted comment",
  });

  expect(fs.insertInFile).toHaveBeenCalledWith(
    "/src/App.tsx",
    3,
    "// inserted comment"
  );
  expect(result).toBe("Inserted text at line 3");
});

test("insert defaults insert_line to 0 when omitted", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs as any);

  await tool.execute({ command: "insert", path: "/src/App.tsx", new_str: "line" });

  expect(fs.insertInFile).toHaveBeenCalledWith("/src/App.tsx", 0, "line");
});

test("undo_edit command returns an error message without calling fileSystem", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs as any);

  const result = await tool.execute({ command: "undo_edit", path: "/src/App.tsx" });

  expect(result).toContain("not supported");
  expect(fs.viewFile).not.toHaveBeenCalled();
  expect(fs.createFileWithParents).not.toHaveBeenCalled();
  expect(fs.replaceInFile).not.toHaveBeenCalled();
  expect(fs.insertInFile).not.toHaveBeenCalled();
});
