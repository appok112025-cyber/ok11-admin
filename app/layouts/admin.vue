<template>
  <div class="h-screen bg-gray-50 flex overflow-hidden">
    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="sidebarVisible"
      class="fixed inset-0 z-40 lg:hidden"
      @click="sidebarVisible = false"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
    </div>

    <!-- Sidebar -->
    <div
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:inset-0 lg:flex-shrink-0 flex flex-col h-screen',
        sidebarVisible ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Sidebar Header -->
      <div
        class="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0"
      >
        <NuxtLink to="/" class="flex items-center space-x-2 flex-1 min-w-0">
          <div
            class="h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden relative flex-shrink-0"
          >
            <img
              v-if="logoVisible"
              src="/assets/icons/logo.png"
              alt="OK11 Logo"
              class="h-full w-full object-contain"
              @error="handleLogoError"
            />
            <span v-else class="text-blue-600 font-bold text-lg">OK</span>
          </div>
          <div class="min-w-0">
            <h1 class="text-lg font-bold text-gray-900 whitespace-nowrap">
              OK11
            </h1>
          </div>
        </NuxtLink>
        <button
          @click="sidebarVisible = false"
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 overflow-y-auto">
        <div class="space-y-1">
          <!-- Home Link -->
          <NuxtLink
            to="/"
            :class="[
              'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
              $route.path === '/'
                ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            ]"
            @click="sidebarVisible = false"
          >
            <svg
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="
                $route.path === '/'
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-gray-600'
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              v-html="getIcon('home')"
            ></svg>
            <span>Home</span>
          </NuxtLink>

          <!-- Users Link -->
          <NuxtLink
            to="/users"
            :class="[
              'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
              $route.path === '/users'
                ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            ]"
            @click="sidebarVisible = false"
          >
            <svg
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="
                $route.path === '/users'
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-gray-600'
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              v-html="getIcon('users')"
            ></svg>
            <span>Users</span>
          </NuxtLink>

          <!-- Notifications Link -->
          <NuxtLink
            to="/notifications"
            :class="[
              'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
              $route.path === '/notifications'
                ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            ]"
            @click="sidebarVisible = false"
          >
            <svg
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="
                $route.path === '/notifications'
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-gray-600'
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span>Notifications</span>
          </NuxtLink>

          <!-- Navigation Groups -->
          <div v-for="group in navigationGroups" :key="group.name" class="pt-2">
            <!-- Group Header -->
            <button
              @click="toggleGroup(group.name)"
              class="w-full group flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <div class="flex items-center">
                <svg
                  class="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  v-html="getIcon(group.icon)"
                ></svg>
                <span>{{ group.name }}</span>
              </div>
              <svg
                class="h-4 w-4 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': expandedGroups[group.name] }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            <!-- Group Items -->
            <div
              v-show="expandedGroups[group.name]"
              class="mt-1 space-y-1 pl-4"
            >
              <NuxtLink
                v-for="item in group.items"
                :key="item.name"
                :to="item.href"
                :class="[
                  'group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  $route.path === item.href
                    ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                ]"
                @click="sidebarVisible = false"
              >
                <svg
                  class="mr-3 h-4 w-4 flex-shrink-0"
                  :class="
                    $route.path === item.href
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover:text-gray-600'
                  "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  v-html="getIcon(item.icon)"
                ></svg>
                <span>{{ item.name }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Info -->
      <ClientOnly>
        <div
          class="p-4 border-t border-gray-200 flex-shrink-0 relative"
          @mouseenter="handleUserAreaHover(true)"
          @mouseleave="handleUserAreaHover(false)"
        >
          <div class="flex items-center w-full" @click="toggleUserMenu">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <span class="text-white text-sm font-medium">{{
                  user?.name?.charAt(0) || 'U'
                }}</span>
              </div>
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ user?.name || 'User' }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ user?.email || 'user@example.com' }}
              </p>
            </div>
            <button
              @click.stop="handleLogout"
              :disabled="isLoggingOut"
              class="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Logout"
            >
              <svg
                v-if="!isLoggingOut"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              <svg
                v-else
                class="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            </button>
          </div>
          <div
            v-if="showUserMenu"
            class="absolute inset-x-4 bottom-16 bg-white border border-gray-200 rounded-lg shadow-lg py-2"
          >
            <button
              type="button"
              class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              @click.stop="openChangePasswordDialog"
            >
              <span>Change password</span>
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 11c.828 0 1.5-.672 1.5-1.5S12.828 8 12 8s-1.5.672-1.5 1.5S11.172 11 12 11zm0 2.5a.75.75 0 00-.75.75V16a.75.75 0 001.5 0v-1.75A.75.75 0 0012 13.5zm0-10.5a9 9 0 100 18 9 9 0 000-18z"
                />
              </svg>
            </button>
          </div>
        </div>
        <template #fallback>
          <div class="p-4 border-t border-gray-200 flex-shrink-0">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <span class="text-gray-600 text-sm font-medium">-</span>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">-</p>
                <p class="text-xs text-gray-500 truncate">-</p>
              </div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Main Content -->
    <div class="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Toast Container -->
    <ToastContainer :toasts="toasts" @remove="removeToast" />

    <FormDialog
      :show="showChangePasswordDialog"
      title="Change Password"
      :loading="isChangingPassword"
      max-width="max-w-lg"
      @close="handleChangePasswordDialogClose"
      @submit="handleChangePasswordSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Current password
          </label>
          <input
            v-model="currentPassword"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            autocomplete="current-password"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            New password
          </label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            autocomplete="new-password"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Confirm new password
          </label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            autocomplete="new-password"
          />
        </div>
      </div>
    </FormDialog>

    <ConfirmDialog
      :show="showChangePasswordConfirmDialog"
      title="Change Password"
      message="This will change your password and log you out. Do you want to continue?"
      type="warning"
      confirm-text="Change Password"
      cancel-text="Cancel"
      :loading="isChangingPassword"
      @confirm="handleChangePasswordConfirm"
      @cancel="handleChangePasswordConfirmCancel"
    />

    <!-- Logout Confirmation Dialog -->
    <ConfirmDialog
      :show="showLogoutDialog"
      title="Logout"
      message="Are you sure you want to logout?"
      type="info"
      confirm-text="Logout"
      cancel-text="Cancel"
      :loading="isLoggingOut"
      @confirm="handleLogoutConfirm"
      @cancel="handleLogoutCancel"
    />
  </div>
</template>

<script setup lang="ts">
  const route = useRoute()
  const authStore = useAuthStore()
  const {
    success: showSuccess,
    error: showError,
    toasts,
    removeToast,
  } = useToast()

  const sidebarVisible = ref(false)
  const isLoggingOut = ref(false)
  const showLogoutDialog = ref(false)
  const logoVisible = ref(true)
  const showUserMenu = ref(false)
  const showChangePasswordDialog = ref(false)
  const showChangePasswordConfirmDialog = ref(false)
  const isChangingPassword = ref(false)
  const currentPassword = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')

  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value
  }

  provide('sidebarVisible', sidebarVisible)
  provide('toggleSidebar', toggleSidebar)

  const handleLogoError = (e: Event) => {
    if (e.target instanceof HTMLImageElement) {
      logoVisible.value = false
    }
  }

  // Ensure we're on the client side for route operations
  const isClient = ref(false)
  onMounted(() => {
    isClient.value = true
  })

  // Accordion state for navigation groups
  const expandedGroups = ref<Record<string, boolean>>({
    Game: true,
    'Help & Legal': true,
  })

  const toggleGroup = (groupName: string) => {
    expandedGroups.value[groupName] = !expandedGroups.value[groupName]
  }

  // Navigation groups with accordion structure
  const navigationGroups = [
    {
      name: 'Game',
      icon: 'sport',
      items: [
        {
          name: 'Matches',
          href: '/matches',
          icon: 'sport',
        },
        {
          name: 'Contests',
          href: '/contests',
          icon: 'star',
        },
        {
          name: 'Teams',
          href: '/teams',
          icon: 'flag',
        },
        {
          name: 'Players',
          href: '/players',
          icon: 'users',
        },
        // {
        //   name: 'Quizzes',
        //   href: '/quizzes',
        //   icon: 'quiz',
        // },
        // {
        //   name: 'Submissions',
        //   href: '/submissions',
        //   icon: 'document',
        // },
      ],
    },
    {
      name: 'Help & Legal',
      icon: 'document',
      items: [
        {
          name: 'FAQs',
          href: '/faqs',
          icon: 'help',
        },
        {
          name: 'About',
          href: '/about',
          icon: 'info',
        },
        {
          name: 'Terms',
          href: '/terms',
          icon: 'document',
        },
        {
          name: 'Points',
          href: '/points',
          icon: 'star',
        },
      ],
    },
  ]

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: 'home',
    },
    {
      name: 'Users',
      href: '/users',
      icon: 'users',
    },
    {
      name: 'Matches',
      href: '/matches',
      icon: 'sport',
    },
    {
      name: 'Contests',
      href: '/contests',
      icon: 'star',
    },
    {
      name: 'Teams',
      href: '/teams',
      icon: 'flag',
    },
    {
      name: 'Players',
      href: '/players',
      icon: 'users',
    },
    // {
    //   name: 'Quizzes',
    //   href: '/quizzes',
    //   icon: 'quiz',
    // },
    {
      name: 'FAQs',
      href: '/faqs',
      icon: 'help',
    },
    {
      name: 'About',
      href: '/about',
      icon: 'info',
    },
    {
      name: 'Terms',
      href: '/terms',
      icon: 'document',
    },
    {
      name: 'Points',
      href: '/points',
      icon: 'star',
    },
  ]

  const getIcon = (iconName: string) => {
    const icons: Record<string, string> = {
      home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />',
      users:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />',
      help: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
      info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
      document:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
      star: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />',
      sport:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />',
      flag: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />',
      quiz: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
    }
    return icons[iconName] || icons.home
  }

  const pageTitle = computed(() => {
    if (!isClient.value || !route.path) return 'Dashboard'
    const currentItem = navigationItems.find(item => item.href === route.path)
    return currentItem?.name || 'Dashboard'
  })

  // Get user information for sidebar - handle SSR properly
  const user = computed(() => {
    if (process.server) {
      return null // Don't render user data on server to avoid hydration mismatch
    }
    return authStore.user
  })

  // Ensure consistent title rendering
  useHead({
    title: 'OK11',
  })

  const handleLogout = () => {
    showLogoutDialog.value = true
  }

  const handleLogoutConfirm = async () => {
    try {
      isLoggingOut.value = true
      showLogoutDialog.value = false
      authStore.logout()
      showSuccess('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      isLoggingOut.value = false
    }
  }

  const handleLogoutCancel = () => {
    showLogoutDialog.value = false
  }

  const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
  }

  const handleUserAreaHover = (isHovering: boolean) => {
    showUserMenu.value = isHovering
  }

  const resetChangePasswordForm = () => {
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  }

  const openChangePasswordDialog = () => {
    showChangePasswordDialog.value = true
    showUserMenu.value = false
  }

  const handleChangePasswordDialogClose = () => {
    showChangePasswordDialog.value = false
    resetChangePasswordForm()
  }

  const handleChangePasswordSubmit = () => {
    if (
      !currentPassword.value ||
      !newPassword.value ||
      !confirmPassword.value
    ) {
      showError('Please fill in all password fields')
      return
    }

    if (newPassword.value.length < 6) {
      showError('New password must be at least 6 characters')
      return
    }

    if (newPassword.value !== confirmPassword.value) {
      showError('New password and confirm password do not match')
      return
    }

    showChangePasswordConfirmDialog.value = true
  }

  const handleChangePasswordConfirmCancel = () => {
    showChangePasswordConfirmDialog.value = false
  }

  const handleChangePasswordConfirm = async () => {
    try {
      isChangingPassword.value = true
      showChangePasswordConfirmDialog.value = false

      await $fetch('/api/auth/change-password', {
        method: 'POST',
        body: {
          currentPassword: currentPassword.value,
          newPassword: newPassword.value,
          confirmPassword: confirmPassword.value,
        },
      })

      showSuccess('Password changed successfully')
      handleChangePasswordDialogClose()

      await authStore.logout()
      showSuccess('Logged out successfully')
    } catch (error: any) {
      console.error('Change password error:', error)

      const message =
        (error && (error as any).data && (error as any).data.message) ||
        (error as any).statusMessage ||
        'Failed to change password. Please check your current password and try again.'

      showError(message)
    } finally {
      isChangingPassword.value = false
    }
  }

  // Close sidebar on route change
  watch(
    () => route.path,
    () => {
      sidebarVisible.value = false
    }
  )

  // Validate token periodically when user is authenticated
  onMounted(() => {
    if (authStore.isAuthenticated) {
      // Validate token every 5 minutes
      const validateToken = async () => {
        if (!(await authStore.validateToken())) {
          await authStore.logout()
          navigateTo('/login')
        }
      }

      // Initial validation after a delay
      setTimeout(validateToken, 2000)

      // Periodic validation
      const interval = setInterval(validateToken, 5 * 60 * 1000)

      // Cleanup on unmount
      onUnmounted(() => {
        clearInterval(interval)
      })
    }
  })
</script>
