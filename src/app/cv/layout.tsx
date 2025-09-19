// app/components/Layout.tsx
'use client'; // Marks as client-side component for JS features

import { useEffect, useRef, useState, useMemo } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  ratios?: number[]; // Array of ratio values (e.g., [1, 2] or [1, 3, 1])
  gap?: number; // Gap in rem units (e.g., 4 = 1rem)
  className?: string; // Additional Tailwind classes
}

const Layout = ({ children, ratios = [1, 2], gap = 4, className = '' }: LayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container && !CSS.supports('display', 'masonry')) {
      const items = Array.from(container.children) as HTMLDivElement[];
      const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
      const cols = ratios.map(r => ({
        width: `${(r / totalRatio) * 100}%`,
        items: [] as HTMLDivElement[],
      }));

      items.sort((a, b) => a.offsetHeight - b.offsetHeight);

      items.forEach(item => {
        const shortest = cols.reduce((min, col, i) =>
          cols[min.i].items.length * (gap * 4) + cols[min.i].items.reduce((h, it) => h + it.offsetHeight, 0) <
          cols[i].items.length * (gap * 4) + cols[i].items.reduce((h, it) => h + it.offsetHeight, 0)
            ? min
            : { i },
          { i: 0 }
        );
        cols[shortest.i].items.push(item);
      });

      container.innerHTML = '';
      const colDivs = cols.map((col, i) => {
        const div = document.createElement('div');
        div.style.flex = `0 0 ${col.width}`;
        div.style.marginBottom = `${gap}rem`;
        col.items.forEach(item => div.appendChild(item));
        return div;
      });
      colDivs.forEach(div => container.appendChild(div));
      container.style.display = 'flex';
      container.style.gap = `${gap}rem`;
      container.style.flexWrap = 'nowrap';
    }
  }, [ratios, gap]);

  // Calculate dynamic styles for layout (memoized to prevent infinite loops)
  const dynamicStyles = useMemo(() => {
    if (typeof window === 'undefined' || typeof window?.CSS === 'undefined') {
      return {}
    }

    const frUnits = ratios.join('fr ');

    const styles: React.CSSProperties = {
      display: CSS.supports('display', 'masonry') ? 'masonry' : 'block',
      gap: `${gap}rem`,
      ...(CSS.supports('display', 'masonry')
        ? {
            // @ts-ignore - masonry properties not fully typed in React CSSProperties
            masonryTemplateColumns: `${frUnits}fr`,
            gridTemplateColumns: `${frUnits}fr`,
            masonryAutoFlow: 'dense',
          }
        : {
            display: 'grid',
            gridTemplateColumns: `${frUnits}fr`,
            gridAutoRows: 'min-content',
          }),
    };

    return styles;
  }, [ratios, gap]);

  const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
  const columnWidths = ratios.map(r => `${(r / totalRatio) * 100}%`);

  return (
    <div
      ref={containerRef}
      className={`mx-auto max-w-[100vw] p-${gap} ${className}`}
      style={dynamicStyles}
    >
      {children}
    </div>
  );
};

export default Layout;
