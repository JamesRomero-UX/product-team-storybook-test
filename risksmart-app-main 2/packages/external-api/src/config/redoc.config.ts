export const generateRedocConfig = () => ({
  defaultTheme: {
    colors: {
      primary: { main: '#010101ff' }, // buttons, links, highlights
      // main element border radius.
      shape: { borderRadius: '8px' },
      text: {
        primary: '#2D2D53', // main body text
        secondary: '#8A8E9E', // subdued text
      },
      border: {
        dark: '#C9CBD1',
        light: '#E8E9EE',
      },
      http: {
        get: '#00DECB',
        post: '#4F46E5',
        put: '#0EA5E9',
        delete: '#F43F5E',
        patch: '#F59E0B',
        options: '#64748B',
        basic: '#64748B',
        link: '#00DECB',
        unknown: '#94A3B8',
      },
      response: {
        success: '#10B981',
        error: '#EF4444',
        info: '#0EA5E9',
        redirect: '#F59E0B',
      },
      background: {
        general: '#FFFFFF',
        dark: '#14143A',
        light: '#F5F5F9',
      },
    },

    typography: {
      fontFamily:
        'Sora, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      fontSize: '16px',
      lineHeight: '1.6',
      headings: {
        fontFamily:
          'Sora, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        fontWeight: '700',
        lineHeight: '1.25',
      },
      code: {
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
        fontSize: '12px',
      },
      links: {
        color: '#00DECB',
        visited: '#00BCAA',
        hover: '#00CDBA',
      },
    },

    sidebar: {
      backgroundColor: '#14143A', // dark rail on the left
      textColor: '#E5E7EB',
      activeTextColor: '#FFFFFF',
      width: '280px',
      groupItems: {
        activeBackgroundColor: 'rgba(0, 222, 203, 0.16)',
        activeTextColor: '#00DECB',
        hoverBackgroundColor: 'rgba(255,255,255,0.05)',
        textTransform: 'none',
      },
      level1Items: {
        activeBackgroundColor: 'rgba(0, 222, 203, 0.16)',
        activeTextColor: '#00DECB',
        hoverBackgroundColor: 'rgba(255,255,255,0.05)',
        textTransform: 'none',
      },
      arrow: {
        color: '#8A8E9E',
      },
    },

    rightPanel: {
      backgroundColor: '#0E1222', // your dark panel bg
      textColor: '#E6E8EE',
      width: '36%',
      borderRadius: '10px',
    },

    codeBlock: {
      backgroundColor: '#0B1020',
      textColor: '#FFFFFF',
      borderRadius: '10px',
    },

    schema: {
      linesColor: '#E8E9EE',
      typeNameColor: '#14143A',
      typeTitleColor: '#14143A',
    },

    // Subtle card/box look like the screenshot’s tiles
    fab: { backgroundColor: '#00DECB', color: '#0B1020' },
    spacing: { unit: 8, sectionVertical: 24, sectionHorizontal: 24 },
    logo: {
      gutter: '16px',
      maxWidth: '200px',
    },
  },
});

export type RedocConfig = ReturnType<typeof generateRedocConfig>;
