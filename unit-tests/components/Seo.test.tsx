import type { ComponentProps } from "react";
import { render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import Seo from "../../src/components/Seo";

const SITE_URL = "https://dev-diary.in";
const DEFAULT_DESCRIPTION =
  "Dev Diary is an all-in-one interview preparation app for software engineers. Track DSA progress, practice in a technical interview simulator, master system design, and build your own coding knowledge base.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const metaContent = (attr: "name" | "property", key: string) =>
  document
    .querySelector(`meta[${attr}="${key}"]`)
    ?.getAttribute("content") ?? null;

const canonicalHref = () =>
  document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
  null;

const renderSeo = (props: ComponentProps<typeof Seo>) =>
  render(
    <HelmetProvider>
      <Seo {...props} />
    </HelmetProvider>
  );

describe("Seo", () => {
  test("sets document.title to '<title> | Dev Diary'", async () => {
    renderSeo({ title: "DSA Practice" });

    await waitFor(() =>
      expect(document.title).toBe("DSA Practice | Dev Diary")
    );
  });

  test("uses the default description when none is provided", async () => {
    renderSeo({ title: "DSA Practice" });

    await waitFor(() =>
      expect(metaContent("name", "description")).toBe(DEFAULT_DESCRIPTION)
    );
  });

  test("uses a custom description when provided", async () => {
    renderSeo({ title: "Blogs", description: "Read the latest posts." });

    await waitFor(() =>
      expect(metaContent("name", "description")).toBe(
        "Read the latest posts."
      )
    );
  });

  test("builds the canonical URL and og:url from the site root by default", async () => {
    renderSeo({ title: "Home" });

    await waitFor(() => expect(canonicalHref()).toBe(`${SITE_URL}/`));
    expect(metaContent("property", "og:url")).toBe(`${SITE_URL}/`);
  });

  test("builds the canonical URL and og:url from a custom path", async () => {
    renderSeo({ title: "Blog post", path: "/blogs/my-post" });

    await waitFor(() =>
      expect(canonicalHref()).toBe(`${SITE_URL}/blogs/my-post`)
    );
    expect(metaContent("property", "og:url")).toBe(
      `${SITE_URL}/blogs/my-post`
    );
  });

  test("omits the robots meta tag by default (indexable)", async () => {
    renderSeo({ title: "Home" });

    await waitFor(() => expect(document.title).toBe("Home | Dev Diary"));
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
  });

  test("adds a noindex, nofollow robots meta tag when noindex is true", async () => {
    renderSeo({ title: "Admin", noindex: true });

    await waitFor(() =>
      expect(metaContent("name", "robots")).toBe("noindex, nofollow")
    );
  });

  test("falls back to the default OG image when none is provided", async () => {
    renderSeo({ title: "Home" });

    await waitFor(() =>
      expect(metaContent("property", "og:image")).toBe(DEFAULT_OG_IMAGE)
    );
  });

  test("prefixes a site-root-relative image path with the site URL", async () => {
    renderSeo({ title: "Post", image: "/covers/foo.png" });

    await waitFor(() =>
      expect(metaContent("property", "og:image")).toBe(
        `${SITE_URL}/covers/foo.png`
      )
    );
  });

  test("leaves an absolute image URL untouched", async () => {
    renderSeo({ title: "Post", image: "https://cdn.example.com/foo.png" });

    await waitFor(() =>
      expect(metaContent("property", "og:image")).toBe(
        "https://cdn.example.com/foo.png"
      )
    );
  });

  test("defaults og:type to 'website'", async () => {
    renderSeo({ title: "Home" });

    await waitFor(() => expect(metaContent("property", "og:type")).toBe("website"));
  });

  test("sets og:type to 'article' when type='article' is passed", async () => {
    renderSeo({ title: "Blog post", type: "article" });

    await waitFor(() =>
      expect(metaContent("property", "og:type")).toBe("article")
    );
  });

  test("mirrors title/description/image into the twitter card meta tags", async () => {
    renderSeo({ title: "Card test", description: "A description." });

    await waitFor(() =>
      expect(metaContent("name", "twitter:title")).toBe(
        "Card test | Dev Diary"
      )
    );
    expect(metaContent("name", "twitter:description")).toBe(
      "A description."
    );
    expect(metaContent("name", "twitter:card")).toBe("summary_large_image");
  });
});
