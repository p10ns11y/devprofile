'use client';

import React, { useMemo } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  ratios?: number[]; // Array of ratio values (e.g., [1, 2] or [1, 3, 1])
  gap?: number; // Gap in rem units (e.g., 4 = 1rem)
  className?: string; // Additional Tailwind classes
}

function createFallbackMasonaryLayoutRef(ratios: number[], gap: number) {
  let container: HTMLDivElement | null = null;
  let originalContainerStyle: string | null = null;
  let isApplied = false; // Prevent multiple applications

  return function fallbackMasonaryLayoutRef(node: HTMLDivElement | null) {
    container = node;

    if (!node || isApplied) {
      if (container && originalContainerStyle) {
        // Restore original styles
        const styleProps = originalContainerStyle.split(';').filter(prop => prop.trim());
        styleProps.forEach(prop => {
          const [key, value] = prop.split(':').map(s => s.trim());
          if (key && value) {
            container!.style.setProperty(key, value);
          }
        });
      }
      return;
    }

    if (container) {
      originalContainerStyle = container.style.cssText;
    }

    if (container && !CSS.supports('display', 'masonry') && container.children.length > 0) {
      // Find mainContent element safely
      const mainContentElement = Array.from(container.children).find((child: Element) => {
        return child.id === 'mainContent' && child instanceof HTMLElement;
      }) as HTMLDivElement | undefined;

      // Filter valid child elements (excluding mainContent)
      const items = Array.from(container.children)
        .filter((child: Element): child is HTMLElement =>
          child instanceof HTMLElement && child.id !== 'mainContent'
        );

      // Only proceed if we have items to work with
      if (items.length === 0) return;

      const totalRatio = ratios.reduce((sum: number, r: number) => sum + r, 0);
      const cols = ratios.map((r: number) => ({
        width: `${(r / totalRatio) * 100}%`,
        items: [] as HTMLElement[],
      }));
      
      // Column capacities: proportional content holding based on width ratios
      const columnCapacities = ratios.map(r => r / totalRatio);

      // Adaptive placement with forward-looking height minimization
      // Maintain running char counts for each column
      const charsPerColumn = cols.map(() => 0);
      // mainContent fixed to column 0 (left)
      if (mainContentElement) {
        charsPerColumn[0] += mainContentElement.innerText.length;
      }

      // Evaluate each item in original order
      const placedItems = items.map((item, index) => {
        const itemChars = item.innerText.length;
        
        // Evaluate placement in each possible column
        const placementOptions = ratios.map((_, colIndex) => {
          // Calculate height (chars / capacity factor) for all columns after placement
          const tempChars = [...charsPerColumn];
          tempChars[colIndex] += itemChars;
          
          // Height metric: normalized by column capacity for fair comparison
          const heights = tempChars.map((chars, i) => chars / columnCapacities[i]);
          const maxHeight = Math.max(...heights);
          const heightBalanceScore = maxHeight; // Minimize the maximum height (perfect balance)
          
          return {
            colIndex,
            maxHeightAfter: maxHeight,
            heights: [...heights],
            balanceScore: heightBalanceScore
          };
        });

        // Choose best placement: lowest maximum height
        const bestPlacement = placementOptions.reduce((best, current) => 
          current.balanceScore < best.balanceScore ? current : best
        );

        // Apply the placement
        charsPerColumn[bestPlacement.colIndex] += itemChars;
        cols[bestPlacement.colIndex].items.push(item);

        return {
          element: item,
          placement: bestPlacement
        };
      });

      // Post-placement readjustment for extreme imbalances
      const finalHeights = charsPerColumn.map((chars, i) => chars / columnCapacities[i]);
      const maxHeight = Math.max(...finalHeights);
      const minHeight = Math.min(...finalHeights);
      const imbalanceRatio = maxHeight / minHeight;

      // If imbalance > 1.4 (40% taller), try moving the last element to improve balance
      const THRESHOLD = 1.4;
      if (imbalanceRatio > THRESHOLD && placedItems.length > 0) {
        const lastPlaced = placedItems[placedItems.length - 1];
        const originalCol = lastPlaced.placement.colIndex;
        const alternateCol = 1 - originalCol; // Assumes 2 columns

        // Calculate new distribution if we move the last item
        const testChars = [...charsPerColumn];
        testChars[originalCol] -= lastPlaced.element.innerText.length;
        testChars[alternateCol] += lastPlaced.element.innerText.length;
        
        const alternativeHeights = testChars.map((chars, i) => chars / columnCapacities[i]);
        const alternativeMaxHeight = Math.max(...alternativeHeights);
        
        // If moving improves balance (lower max height), apply it
        if (alternativeMaxHeight < maxHeight) {
          // Remove from original column
          const originalItems = cols[originalCol].items;
          const itemIndex = originalItems.indexOf(lastPlaced.element);
          if (itemIndex > -1) {
            originalItems.splice(itemIndex, 1);
          }
          
          // Add to new column
          cols[alternateCol].items.push(lastPlaced.element);
          
          // Update char counts
          charsPerColumn[originalCol] -= lastPlaced.element.innerText.length;
          charsPerColumn[alternateCol] += lastPlaced.element.innerText.length;
        }
      }

      // Simply prepend mainContent to the first column
      if (mainContentElement) {
        cols[0].items.unshift(mainContentElement);
      }

      // Clear and rebuild DOM
      if (container) {
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.gap = `${gap}rem`;
        container.style.flexWrap = 'nowrap';
  
        const colDivs = cols.map((col: { width: string; items: HTMLElement[] }, i: number) => {
          const div = document.createElement('div');
          div.style.flex = `0 0 ${col.width}`; // As flex item
          // div.style.marginBottom = `${gap}rem`;
          div.style.display = 'flex'; // Also flex container
          div.style.flexDirection = 'column';
          div.style.gap = `${gap}rem`;
          // Filter out any null/undefined items before appending
          col.items.filter((item: HTMLElement | undefined) => item).forEach((item: HTMLElement) => div.appendChild(item));
          return div;
        });
  
        colDivs.forEach((div: HTMLDivElement) => container!.appendChild(div));
      }

      isApplied = true;
    }
  };
}
const Layout = ({ children, ratios = [1, 2], gap = 4, className = '' }: LayoutProps) => {
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
            masonryDirection: 'column',
          }
        : {
            display: 'grid',
            gridTemplateColumns: `${frUnits}fr`,
            gridAutoRows: 'min-content',
            gridAutoFlow: 'dense'
          }),
    };

    return styles;
  }, [ratios, gap]);

  const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
  const columnWidths = ratios.map(r => `${(r / totalRatio) * 100}%`);

  return (
    <div
      ref={createFallbackMasonaryLayoutRef(ratios, gap)}
      className={`mx-auto max-w-[100vw] p-${gap} ${className}`}
      style={CSS.supports('display', 'masonry') ? dynamicStyles: {}}
      suppressHydrationWarning
    >
      {React.Children.toArray(children)}
    </div>
  );
};

export default Layout;
