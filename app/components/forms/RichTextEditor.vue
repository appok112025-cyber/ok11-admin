<template>
  <div class="rich-text-editor">
    <!-- Toolbar -->
    <div
      class="border border-gray-300 rounded-t-md bg-gray-50 p-2 flex flex-wrap gap-1"
    >
      <template v-for="tool in toolbarItems" :key="tool.name">
        <button
          v-if="tool.name.startsWith('divider')"
          class="w-px h-6 bg-gray-300 mx-1"
          disabled
        ></button>
        <button
          v-else
          @click="tool.action"
          :class="[
            'p-2 rounded text-sm font-medium transition-colors',
            tool.isActive
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-200',
          ]"
          :title="tool.title"
          type="button"
        >
          <component :is="tool.icon" class="w-4 h-4" />
        </button>
      </template>
    </div>

    <!-- Editor Content -->
    <div class="border border-t-0 border-gray-300 rounded-b-md">
      <editor-content
        :editor="editor"
        class="prose max-w-none p-4 min-h-[200px] focus:outline-none"
        :class="{ 'opacity-50': disabled }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useEditor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import Underline from '@tiptap/extension-underline'

  interface Props {
    modelValue: string
    placeholder?: string
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Start typing...',
    disabled: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const editor = useEditor({
    content: props.modelValue,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          openOnClick: false,
        },
        underline: false,
      }),
      Underline,
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    },
  })

  const toolbarItems = computed(() => [
    {
      name: 'bold',
      title: 'Bold',
      icon: BoldIcon,
      action: () => editor.value?.chain().focus().toggleBold().run(),
      isActive: editor.value?.isActive('bold'),
    },
    {
      name: 'italic',
      title: 'Italic',
      icon: ItalicIcon,
      action: () => editor.value?.chain().focus().toggleItalic().run(),
      isActive: editor.value?.isActive('italic'),
    },
    {
      name: 'underline',
      title: 'Underline',
      icon: UnderlineIcon,
      action: () => editor.value?.chain().focus().toggleUnderline().run(),
      isActive: editor.value?.isActive('underline'),
    },
    {
      name: 'divider1',
      title: '',
      icon: '',
      action: () => {},
      isActive: false,
    },
    {
      name: 'h1',
      title: 'Heading 1',
      icon: H1Icon,
      action: () =>
        editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.value?.isActive('heading', { level: 1 }),
    },
    {
      name: 'h2',
      title: 'Heading 2',
      icon: H2Icon,
      action: () =>
        editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.value?.isActive('heading', { level: 2 }),
    },
    {
      name: 'h3',
      title: 'Heading 3',
      icon: H3Icon,
      action: () =>
        editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.value?.isActive('heading', { level: 3 }),
    },
    {
      name: 'divider2',
      title: '',
      icon: '',
      action: () => {},
      isActive: false,
    },
    {
      name: 'bulletList',
      title: 'Bullet List',
      icon: ListBulletIcon,
      action: () => editor.value?.chain().focus().toggleBulletList().run(),
      isActive: editor.value?.isActive('bulletList'),
    },
    {
      name: 'orderedList',
      title: 'Numbered List',
      icon: ListNumberedIcon,
      action: () => editor.value?.chain().focus().toggleOrderedList().run(),
      isActive: editor.value?.isActive('orderedList'),
    },
  ])

  // Simple text-based icons for better compatibility
  const BoldIcon = () => h('span', { class: 'font-bold text-sm' }, 'B')
  const ItalicIcon = () => h('span', { class: 'italic text-sm' }, 'I')
  const UnderlineIcon = () => h('span', { class: 'underline text-sm' }, 'U')
  const H1Icon = () => h('span', { class: 'font-bold text-sm' }, 'H1')
  const H2Icon = () => h('span', { class: 'font-bold text-sm' }, 'H2')
  const H3Icon = () => h('span', { class: 'font-bold text-sm' }, 'H3')
  const ListBulletIcon = () => h('span', { class: 'text-sm' }, '•')
  const ListNumberedIcon = () => h('span', { class: 'text-sm' }, '1.')

  // Watch for external changes to modelValue
  watch(
    () => props.modelValue,
    newValue => {
      if (editor.value && editor.value.getHTML() !== newValue) {
        editor.value.commands.setContent(newValue)
      }
    }
  )

  // Watch for disabled state
  watch(
    () => props.disabled,
    disabled => {
      if (editor.value) {
        editor.value.setEditable(!disabled)
      }
    }
  )

  onMounted(() => {
    if (editor.value) {
      editor.value.setEditable(!props.disabled)
    }
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })
</script>

<style>
  .rich-text-editor .ProseMirror {
    outline: none;
    min-height: 200px;
  }

  .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .rich-text-editor .ProseMirror h1 {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0.5em 0;
  }

  .rich-text-editor .ProseMirror h2 {
    font-size: 1.25em;
    font-weight: bold;
    margin: 0.5em 0;
  }

  .rich-text-editor .ProseMirror h3 {
    font-size: 1.1em;
    font-weight: bold;
    margin: 0.5em 0;
  }

  .rich-text-editor .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  .rich-text-editor .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  .rich-text-editor .ProseMirror li {
    margin: 0.25em 0;
    display: list-item;
  }

  .rich-text-editor .ProseMirror strong {
    font-weight: bold;
  }

  .rich-text-editor .ProseMirror em {
    font-style: italic;
  }

  .rich-text-editor .ProseMirror u {
    text-decoration: underline;
  }
</style>
