import { Helmet } from "react-helmet-async";

const SITE_URL = "https://dev-diary-frontend-sigma.vercel.app";
const DEFAULT_DESCRIPTION =
  "Dev Diary helps you crack product-based company interviews. Track DSA progress, practice with a technical interview simulator, master system design, and build your own coding knowledge base — all in one place.";

interface SeoProps {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}

const Seo = ({ title, description = DEFAULT_DESCRIPTION, path = "/", noindex = false }: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | Dev Diary`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default Seo;
