'use client';

import type { IconButtonProps, SpanProps } from '@chakra-ui/react';
import { ClientOnly, IconButton, Skeleton, Span } from '@chakra-ui/react';
import * as React from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';

export type ColorMode = 'light' | 'dark';

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

export interface ColorModeProviderProps {
  children?: React.ReactNode;
  defaultTheme?: ColorMode;
  storageKey?: string;
  attribute?: string;
  disableTransitionOnChange?: boolean;
}

const ColorModeContext = React.createContext<UseColorModeReturn>({
  colorMode: 'light',
  setColorMode: () => {},
  toggleColorMode: () => {},
});

const DEFAULT_STORAGE_KEY = 'househub-theme';

function getSystemTheme(): ColorMode {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(mode: ColorMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}

export function ColorModeProvider({
  children,
  defaultTheme = 'light',
  storageKey = DEFAULT_STORAGE_KEY,
}: ColorModeProviderProps) {
  const [colorMode, setColorModeState] = React.useState<ColorMode>(defaultTheme);

  React.useEffect(() => {
    try {
      const stored = (localStorage.getItem(storageKey) ||
        localStorage.getItem('theme')) as ColorMode | null;
      const initial = stored === 'dark' || stored === 'light' ? stored : getSystemTheme();
      setColorModeState(initial);
      applyTheme(initial);
    } catch {
      // Fallback if localStorage is inaccessible
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem(storageKey) || localStorage.getItem('theme');
        if (!stored) {
          const next = e.matches ? 'dark' : 'light';
          setColorModeState(next);
          applyTheme(next);
        }
      } catch {
        // Fallback
      }
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [storageKey]);

  const setColorMode = React.useCallback(
    (mode: ColorMode) => {
      setColorModeState(mode);
      try {
        localStorage.setItem(storageKey, mode);
        localStorage.setItem('theme', mode);
      } catch {
        // Fallback
      }
      applyTheme(mode);
    },
    [storageKey]
  );

  const toggleColorMode = React.useCallback(() => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  }, [colorMode, setColorMode]);

  const value = React.useMemo(
    () => ({
      colorMode,
      setColorMode,
      toggleColorMode,
    }),
    [colorMode, setColorMode, toggleColorMode]
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode(): UseColorModeReturn {
  return React.useContext(ColorModeContext);
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? dark : light;
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? <LuMoon /> : <LuSun />;
}

interface ColorModeButtonProps extends Omit<IconButtonProps, 'aria-label'> {}

export const ColorModeButton = React.forwardRef<HTMLButtonElement, ColorModeButtonProps>(
  function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode();
    return (
      <ClientOnly fallback={<Skeleton boxSize="9" />}>
        <IconButton
          onClick={toggleColorMode}
          variant="ghost"
          aria-label="Toggle color mode"
          size="sm"
          ref={ref}
          {...props}
          css={{
            _icon: {
              width: '5',
              height: '5',
            },
          }}
        >
          <ColorModeIcon />
        </IconButton>
      </ClientOnly>
    );
  }
);

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    );
  }
);

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(function DarkMode(props, ref) {
  return (
    <Span
      color="fg"
      display="contents"
      className="chakra-theme dark"
      colorPalette="gray"
      colorScheme="dark"
      ref={ref}
      {...props}
    />
  );
});
