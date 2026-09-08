import { Helmet } from "react-helmet-async";

const SITE_URL = "https://dev-diary.in";
const DEFAULT_DESCRIPTION =
  "Dev Diary is an all-in-one interview preparation app for software engineers. Track DSA progress, practice in a technical interview simulator, master system design, and build your own coding knowledge base.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SeoProps {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  /** Absolute URL, or a site-root-relative path like "/covers/foo.png". */
  image?: string;
  /** "article" for blog posts, so social crawlers render them as articles rather than a site. */
  type?: "website" | "article";
}

const Seo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  noindex = false,
  image,
  type = "website",
}: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | Dev Diary`;
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default Seo;
