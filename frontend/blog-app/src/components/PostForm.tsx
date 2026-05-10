import React, { useEffect, useState, useRef } from 'react';
import {Button,Card,CardBody,Input,Select,SelectItem,Chip,SelectSection,Dropdown,DropdownTrigger,DropdownMenu,DropdownItem} from '@nextui-org/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Image from '@tiptap/extension-image';

import { Bold, Italic, Undo, Redo,ImagePlus,List,ListOrdered,ChevronDown,X} from 'lucide-react';
import { Post, Category, Tag, PostStatus } from '../services/apiService';
import { apiService } from '../services/apiService';

interface PostFormProps {
  initialPost?: Post | null;
  onSubmit: (postData: {
    title: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    status: PostStatus;
    imageUrl?: string;
  }) => Promise<void>;
  onCancel: () => void;
  categories: Category[];
  availableTags: Tag[];
  isSubmitting?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({
  initialPost,
  onSubmit,
  onCancel,
  categories,
  availableTags,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [categoryId, setCategoryId] = useState(initialPost?.category?.id || '');
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialPost?.tags || []);
  const [status, setStatus] = useState<PostStatus>(
    initialPost?.status || PostStatus.DRAFT
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [imageUrl, setImageUrl] = useState(initialPost?.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, 
        bulletList: false, 
        orderedList: false,
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
        class: 'rounded-lg max-w-full h-auto my-4',},
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      ListItem,
    ],
    content: initialPost?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-2 border border-white/10 rounded-lg bg-[#0b1121] text-white',
      },
    },
  });

  useEffect(() => {
    if (initialPost && editor) {
      setTitle(initialPost.title);
      editor.commands.setContent(initialPost.content);
      setCategoryId(initialPost.category?.id);
      setSelectedTags(initialPost.tags);
      setStatus(initialPost.status || PostStatus.DRAFT);
    }
  }, [initialPost, editor]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!editor?.getHTML() || editor?.getHTML() === '<p></p>') {
      newErrors.content = 'Content is required';
    }
    if (!categoryId) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit({
      title: title.trim(),
      content: editor?.getHTML() || '',
      categoryId: categoryId,
      tagIds: selectedTags.map(tag => tag.id),
      status,
      imageUrl,
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await apiService.uploadImage(file);
      setImageUrl(url);
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleTagAdd = (tag: Tag) => {
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 10) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove: Tag) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleHeadingSelect = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  const inputStyles = {
    label: "text-slate-50",
    input: "text-white",
    innerWrapper: "bg-transparent",
    inputWrapper: [
      "bg-[#0f172a]", 
      "border-white/10",
      "group-data-[focus=true]:border-primary",
      "group-data-[hover=true]:bg-[#1e293b]",
    ],
  };

  const selectProps = {
    variant: "bordered" as const,
    classNames: inputStyles, 
    listboxProps: {
      itemClasses: {
        base: [
          "rounded-md",
          "text-white/80",
          "transition-opacity",
          "data-[hover=true]:text-cyan-400",
          "data-[hover=true]:bg-cyan-400/10",
        ],
      },
    },
  };

  const suggestedTags = availableTags
    .filter(tag => !selectedTags.includes(tag))
    .slice(0, 5);

  return (
    <>
    <div className="starfield" />
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className='bg-[#0B1120]'>
        <CardBody className="space-y-4">
          <div className="space-y-2">
            <Input
              label="Title"
              variant="bordered"
              classNames={inputStyles}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isInvalid={!!errors.title}
              errorMessage={errors.title}
              isRequired
            />
          </div>

          <div className="space-y-2">
            <div className="bg-[#1e293b]/50 backdrop-blur-md border border-white/10 p-2 rounded-t-lg flex gap-2 items-center text-white/70">
              <Dropdown className="bg-[#1e293b]">
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    className='toolbar-btn'
                    size="sm"
                    endContent={<ChevronDown size={16} />}
                  >
                    Heading
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  onAction={(key) => handleHeadingSelect(parseInt(key as string) as 1 | 2 | 3)}
                  aria-label="Heading levels"
                  className="bg-[#1e293b] text-white/80"
                >
                  <DropdownItem key="1" className={editor?.isActive('heading', { level: 1 }) ? 'bg-default-200' : ''}>
                    Heading 1
                  </DropdownItem>
                  <DropdownItem key="2" className={editor?.isActive('heading', { level: 2 }) ? 'bg-default-200' : ''}>
                    Heading 2
                  </DropdownItem>
                  <DropdownItem key="3" className={editor?.isActive('heading', { level: 3 }) ? 'bg-default-200' : ''}>
                    Heading 3
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Button
                size="sm"
                isIconOnly
                variant="flat"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive('bold') ? 'toolbar-btn toolbar-btn-active' : 'toolbar-btn'}
              >
                <Bold size={16} />
              </Button>
              <Button
                size="sm"
                isIconOnly
                variant="flat"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={editor?.isActive('italic') ? 'toolbar-btn toolbar-btn-active' : 'toolbar-btn'}
              >
                <Italic size={16} />
              </Button>

              <div className="h-6 w-px bg-default-300 mx-2" />

              <Button
                size="sm"
                isIconOnly
                variant="flat"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={editor?.isActive('bulletList') ? 'toolbar-btn toolbar-btn-active' : 'toolbar-btn'}
              >
                <List size={16} />
              </Button>
              <Button
                size="sm"
                isIconOnly
                variant="flat"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={editor?.isActive('orderedList') ? 'toolbar-btn toolbar-btn-active' : 'toolbar-btn'}
              >
                <ListOrdered size={16} />
              </Button>

              <div className="h-6 w-px bg-default-300 mx-2" />

              <Button
                size="sm"
                isIconOnly
                variant="flat"
                onClick={() => editor?.chain().focus().undo().run()}
                //isDisabled={!editor?.can().undo()}
                className={editor?.isActive('undo') ? 'toolbar-btn toolbar-btn-active' : 'toolbar-btn'}
              >
                <Undo size={16} />
              </Button>
              <Button
                size="sm"
                isIconOnly
                variant="flat"
                onClick={() => editor?.chain().focus().redo().run()}
                //isDisabled={!editor?.can().redo()}
                className={editor?.isActive('redo') ? 'toolbar-btn toolbar-btn-active' : 'toolbar-btn'}
              >
                <Redo size={16} />
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label className="cursor-pointer"><input type="file" ref={fileInputRef} accept="image/*" hidden onChange={(e) => {
                if (e.target.files?.[0]) {handleImageUpload(e.target.files[0]);}}} />
                <Button isIconOnly size="sm" variant="flat" isLoading={uploading} onClick={() => fileInputRef.current?.click()} className='toolbar-btn toolbar-btn-active:toolbar-btn'>
                  <ImagePlus size={16} />
                </Button>
              </label>

              {imageUrl && (<img src={imageUrl} className="h-10 rounded" />)}
            </div>

            <EditorContent editor={editor} />
            {errors.content && (
              <div className="text-danger text-sm">{errors.content}</div>
            )}
          </div>

          <div className="space-y-2">
            <Select
              label="Category"
              {...selectProps}
              selectedKeys={categoryId ? [categoryId] : []}
              onChange={(e) => setCategoryId(e.target.value)}
              isInvalid={!!errors.category}
              errorMessage={errors.category}
              isRequired
            >
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-slate-900">
                  {cat.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Select
              label="Add Tags"
              {...selectProps}
              selectedKeys={selectedTags.map(tag => tag.id)}>
              <SelectSection>
                {suggestedTags.map((tag) => (
                  <SelectItem
                    key={tag.id}
                    value={tag.id}
                    onClick={() => handleTagAdd(tag)}
                  >
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectSection>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <Chip
                  key={tag.id}
                  className="tag-asteroid"
                  onClose={() => handleTagRemove(tag)}
                  variant="flat"
                  endContent={<X size={14} />}
                >
                  {tag.name}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Select
              label="Status"
              {...selectProps}
              selectedKeys={[status]}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
            >
              <SelectItem key={PostStatus.DRAFT} value={PostStatus.DRAFT}>
                Draft
              </SelectItem>
              <SelectItem key={PostStatus.PUBLISHED} value={PostStatus.PUBLISHED}>
                Published
              </SelectItem>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              className='btn-cancel'
              variant="flat"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="btn-primary"
              type="submit"
              isLoading={isSubmitting}
            >
              {initialPost ? 'Update' : 'Create'} Post
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
    </>
  );
  
};

export default PostForm;