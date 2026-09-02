import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

export const system = createSystem(
  defaultConfig,
  defineConfig({
    theme: {
      tokens: {
        colors: {
          cute: {
            pink: { value: '#FF6B8B' },
            pinkHover: { value: '#FA5276' },
            softPink: { value: '#FFF0F4' },
            borderPink: { value: '#FFE0E9' },

            lavender: { value: '#8B5CF6' },
            softLavender: { value: '#F5F3FF' },
            borderLavender: { value: '#EDE9FE' },

            mint: { value: '#10B981' },
            softMint: { value: '#ECFDF5' },
            borderMint: { value: '#D1FAE5' },

            butter: { value: '#F59E0B' },
            softButter: { value: '#FFFBEB' },
            borderButter: { value: '#FEF3C7' },

            peach: { value: '#F97316' },
            softPeach: { value: '#FFF7ED' },
            borderPeach: { value: '#FFEDD5' },

            sky: { value: '#0EA5E9' },
            softSky: { value: '#F0F9FF' },
            borderSky: { value: '#E0F2FE' },

            cardBg: { value: '#FFFFFF' },
            bgCream: { value: '#FFFDF9' },
            textPrimary: { value: '#2D3748' },
            textSecondary: { value: '#718096' },
            textMuted: { value: '#A0AEC0' },
          },
        },
        radii: {
          '4xl': { value: '2rem' },
        },
      },
    },
  })
);
