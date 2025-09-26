'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'dim';

export default function ThemeDemo() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Apply theme class for CSS theme switching
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <main className="min-h-screen surface1 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-text1 mb-2">
          Brand Theme Demo
        </h1>
        <p className="text-text2 mb-6">
          Toggle between light, dark, and dim themes to see color and shadow changes.
        </p>
      </header>

      {/* Theme selector */}
      <section className="mb-8">
        <form className="flex gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className="px-4 py-2 bg-brand text-text1 rounded-lg rad-shadow hover:bg-surface4"
          >
            Light Theme
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className="px-4 py-2 bg-brand text-text1 rounded-lg rad-shadow hover:bg-surface4"
          >
            Dark Theme
          </button>
          <button
            type="button"
            onClick={() => setTheme('dim')}
            className="px-4 py-2 bg-brand text-text1 rounded-lg rad-shadow hover:bg-surface4"
          >
            Dim Theme
          </button>
        </form>
      </section>

      {/* Surface samples */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-text1 mb-4">Surface Colors</h2>
        <div className="surface-samples">
          <div className="surface1 rad-shadow p-4 rounded-lg">Surface 1</div>
          <div className="surface2 rad-shadow p-4 rounded-lg">Surface 2</div>
          <div className="surface3 rad-shadow p-4 rounded-lg">Surface 3</div>
          <div className="surface4 rad-shadow p-4 rounded-lg">Surface 4</div>
        </div>
      </section>

      {/* Text samples */}
      <section>
        <h2 className="text-xl font-semibold text-text1 mb-4">Text Colors</h2>
        <div className="text-samples">
          <h1 className="text1">
            <span className="inline-block w-4 h-4 bg-brand rounded-full mr-2"></span>
            Text 1 with brand accent
          </h1>
          <h1 className="text2">
            <span className="inline-block w-4 h-4 bg-text1 rounded-full mr-2"></span>
            Text 2
          </h1>
          <p className="text1 mt-4">This paragraph uses text1 color for regular content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p className="text2">This paragraph uses text2 color for secondary content. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>
      </section>
    </main>
  );
}
