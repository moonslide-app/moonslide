/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    darkMode: ['class'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                background: {
                    DEFAULT: 'hsl(var(--background))',
                    primary: 'hsl(var(--background-primary))',
                    secondary: 'hsl(var(--background-secondary))',
                    tertiary: 'hsl(var(--background-tertiary))',
                    quaternary: 'hsl(var(--background-quaternary))',
                },
                foreground: {
                    DEFAULT: 'hsl(var(--foreground))',
                    primary: 'hsl(var(--foreground-primary))',
                    secondary: 'hsl(var(--foreground-secondary))',
                    tertiary: 'hsl(var(--foreground-tertiary))',
                    quaternary: 'hsl(var(--foreground-quaternary))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    border: 'hsl(var(--destructive-border))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    primary: 'hsl(var(--accent-primary))',
                    secondary: 'hsl(var(--accent-secondary))',
                    tertiary: 'hsl(var(--accent-tertiary))',
                    quaternary: 'hsl(var(--accent-quaternary))',
                    foreground: 'hsl(var(--accent-foreground))',
                },

                highlight: {
                    DEFAULT: 'hsl(var(--hightlight))',
                    50: 'hsl(var(--highlight-50))',
                    100: 'hsl(var(--highlight-100))',
                    200: 'hsl(var(--highlight-200))',
                    300: 'hsl(var(--highlight-300))',
                    400: 'hsl(var(--highlight-400))',
                    500: 'hsl(var(--highlight-500))',
                    600: 'hsl(var(--highlight-600))',
                    700: 'hsl(var(--highlight-700))',
                    800: 'hsl(var(--highlight-800))',
                    900: 'hsl(var(--highlight-900))',
                    950: 'hsl(var(--highlight-950))',
                },
            },
            borderRadius: {
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: 0 },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: 0 },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
}
