// src/components/dynamic-breadcrumb.tsx
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";

export function DynamicBreadcrumb() {
  const breadcrumbItems = useBreadcrumb();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (

            <BreadcrumbItem key={`${item.title}-${index}`}>
              {item.isCurrentPage ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.href || '#'}>{item.title}</Link>
                </BreadcrumbLink>
              )}
              {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
            </BreadcrumbItem>
            

        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}