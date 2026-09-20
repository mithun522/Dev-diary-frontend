import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface CatalogBreadcrumbItem {
  label: string;
  to?: string;
}

const CatalogBreadcrumb: React.FC<{ items: CatalogBreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav
      className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      data-cy="tech-interview-catalog-breadcrumb"
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={14} />}
          {item.to ? (
            <Link to={item.to} className="hover:text-foreground hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default CatalogBreadcrumb;
