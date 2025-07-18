// src/hooks/use-breadcrumb.ts
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useBreadcrumbContext } from '@/contexts/breadcrumb-context';

export interface BreadcrumbItem {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
}

// Route configuration for breadcrumb mapping
const routeConfig: Record<string, { title: string; parent?: string }> = {
  '/': { title: 'Forum' },
  '/forum/:slug': { title: 'Category', parent: '/' },
  '/forum/topic/:slug': { title: 'Topic', parent: '/' },
  '/problems': { title: 'Problems', parent: '/' },
  '/problems/:id': { title: 'Problem Detail', parent: '/problems' },
  '/submissions/user-submissions': { title: 'My Submissions', parent: '/' },
  '/submissions/:id': { title: 'Submission Detail', parent: '/submissions/user-submissions' },
  '/login': { title: 'Login', parent: '/' },
  '/register': { title: 'Register', parent: '/' },
  '/members': { title: 'Members', parent: '/' },
  '/groups': { title: 'Groups', parent: '/' },
};

export function useBreadcrumb(): BreadcrumbItem[] {
  const location = useLocation();
  const { customTitles } = useBreadcrumbContext();

  return useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home (Forum)
    breadcrumbs.push({
      title: 'Home',
      href: '/',
      isCurrentPage: location.pathname === '/',
    });

    // If we're at home, return just home
    if (location.pathname === '/') {
      return breadcrumbs;
    }

    // Build breadcrumb path
    let currentPath = '';
    
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      const isLast = i === pathSegments.length - 1;
      
      // Check for custom title first
      let title = customTitles[currentPath];
      
      if (!title) {
        // Try to find exact match first
        let routeKey = currentPath;
        let config = routeConfig[routeKey];
        
        // If no exact match, try with parameter pattern
        if (!config) {
          // Replace potential IDs with parameter patterns
          const parameterizedPath = currentPath
            .replace(/\/[a-f0-9]{24}$/, '/:id')
            .replace(/\/[a-f0-9]{8,}$/, '/:id')
            .replace(/\/[a-z0-9-]+$/, '/:slug'); // Add slug pattern
          config = routeConfig[parameterizedPath];
          routeKey = parameterizedPath;
        }

        if (config) {
          title = config.title;
        } else {
          // Fallback: generate title from path segment
          title = pathSegments[i]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }

      // Don't add Home again if it's already there
      if (title !== 'Forum') {
        breadcrumbs.push({
          title,
          href: isLast ? undefined : currentPath,
          isCurrentPage: isLast,
        });
      }
    }

    return breadcrumbs;
  }, [location.pathname, customTitles]);
}

// Helper function to get route title for dynamic content
export function getRouteTitle(pathname: string, dynamicTitle?: string): string {
  const parameterizedPath = pathname
    .replace(/\/[a-f0-9]{24}$/, '/:id')
    .replace(/\/[a-f0-9]{8,}$/, '/:id')
    .replace(/\/[a-z0-9-]+$/, '/:slug');
  const config = routeConfig[parameterizedPath];
  
  if (dynamicTitle) {
    return dynamicTitle;
  }
  
  return config?.title || 'Page';
}