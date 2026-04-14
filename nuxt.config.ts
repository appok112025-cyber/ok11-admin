import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  debug: true,
  features: {
    devLogs: true,
  },
  devtools: { enabled: true },
  compatibilityDate: '2025-08-26',
  modules: ['@pinia/nuxt'],

  // Set source directory
  srcDir: 'app/',

  // Keep server API routes at root
  serverDir: 'server',

  css: ['~/assets/css/main.css'],

  // Auto-import components
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Auto-import composables
  imports: {
    dirs: [
      'composables',
      'composables/common',
      'composables/content',
      'composables/matches',
      'composables/quizzes',
      'composables/teams',
      'composables/users',
      'stores',
      'utils/api',
      'utils/common',
      'utils/file',
      'utils/validation',
    ],
  },

  vite: {
    plugins: [tailwindcss()] as any,
  },
  app: {
    head: {
      title: 'OK11',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'OK11' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    apiUrl: process.env.API_URL || 'http://127.0.0.1:5925',
    public: {
      apiUrl: process.env.API_URL || 'http://127.0.0.1:5925',
    },
  },
  experimental: {
    typedPages: true,
  },
  nitro: {
    routeRules: {
      '/api/auth/**': {
        cors: true,
      },
    },
  },
})
