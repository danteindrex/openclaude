import { describe, expect, mock, test } from "bun:test";

type RenderNode =
  | string
  | number
  | null
  | undefined
  | RenderNode[]
  | {
      props?: { children?: RenderNode };
      type: string | ((props: { children?: RenderNode }) => RenderNode);
    };

function createNode(type: any, props: Record<string, unknown> | null) {
  const nextProps = { ...(props ?? {}) } as { children?: RenderNode };

  if (type === "Fragment") {
    return nextProps.children ?? null;
  }

  return { type, props: nextProps };
}

function collectText(node: RenderNode, seen = new Set<object>()): string {
  if (node == null || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => collectText(child, seen)).join("");
  }

  if (typeof node === "object") {
    if (seen.has(node)) {
      return "";
    }
    seen.add(node);

    const element = node as {
      children?: RenderNode;
      props?: Record<string, RenderNode>;
      type?: any;
    };

    if (typeof element.type === "function") {
      const propText = Object.entries(element.props ?? {})
        .filter(([key]) => !["children", "className", "style", "href", "aria-label", "type"].includes(key))
        .map(([, value]) => collectText(value as RenderNode, seen))
        .join("");

      return propText + collectText(element.type(element.props ?? {}), seen);
    }

    const propText = Object.entries(element.props ?? {})
      .filter(([key]) => !["children", "className", "style", "href", "aria-label", "type"].includes(key))
      .map(([, value]) => collectText(value as RenderNode, seen))
      .join("");

    const ownChildren = element.props?.children ?? element.children;
    const childText = ownChildren != null ? collectText(ownChildren, seen) : "";

    return propText + childText;
  }

  return "";
}

mock.module("react/jsx-runtime", () => ({
  Fragment: "Fragment",
  jsx: createNode,
  jsxs: createNode,
}));

mock.module("react/jsx-dev-runtime", () => ({
  Fragment: "Fragment",
  jsxDEV: createNode,
}));

mock.module("next/link", () => ({
  default: function MockLink(props: { children?: RenderNode }) {
    return props.children ?? null;
  },
}));

describe("DashboardScreen", () => {
  test("renders stitched dashboard content without throwing", async () => {
    const { DashboardScreen } = await import("./dashboard-screen");
    expect(() => collectText(DashboardScreen())).not.toThrow();
  });

  test("includes the stitched shell and dashboard content", async () => {
    const { DashboardScreen } = await import("./dashboard-screen");
    const text = collectText(DashboardScreen());

    expect(text).toContain("Student Dashboard");
    expect(text).toContain("Habari, Musana!");
    expect(text).toContain("Course Highlights");
    expect(text).toContain("ElimuCore");
  });
});
