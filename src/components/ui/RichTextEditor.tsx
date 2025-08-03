'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Undo,
  Redo,
  Type,
  RotateCcw
} from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onAutoSave?: (content: string) => void;
  autoSaveDelay?: number;
  className?: string;
  editable?: boolean;
  showCharacterCount?: boolean;
  maxCharacters?: number;
  onImageSelect?: (url: string) => void;
}

const MenuButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
}> = ({ onClick, isActive, disabled, icon: Icon, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-[var(--primary)] text-white'
        : 'bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--foreground)]'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <Icon size={16} />
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  editable = true,
  showCharacterCount = true,
  maxCharacters = 10000,
  onImageSelect
}) => {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>('ltr');
  const editorRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<{ start: number; end: number } | null>(null);

  // Save cursor position
  const saveCursorPosition = useCallback(() => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;
    
    const endCaretRange = range.cloneRange();
    endCaretRange.selectNodeContents(editorRef.current);
    endCaretRange.setEnd(range.endContainer, range.endOffset);
    const end = endCaretRange.toString().length;
    
    cursorPositionRef.current = { start, end };
  }, []);

  // Restore cursor position
  const restoreCursorPosition = useCallback(() => {
    if (!editorRef.current || !cursorPositionRef.current) return;
    
    const { start, end } = cursorPositionRef.current;
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let currentOffset = 0;
    let startNode: Node | null = null;
    let endNode: Node | null = null;
    let startOffset = 0;
    let endOffset = 0;
    
    let node;
    while (node = walker.nextNode()) {
      const nodeLength = node.textContent?.length || 0;
      
      if (!startNode && currentOffset + nodeLength >= start) {
        startNode = node;
        startOffset = start - currentOffset;
      }
      
      if (!endNode && currentOffset + nodeLength >= end) {
        endNode = node;
        endOffset = end - currentOffset;
        break;
      }
      
      currentOffset += nodeLength;
    }
    
    if (startNode) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStart(startNode, Math.min(startOffset, startNode.textContent?.length || 0));
      range.setEnd(endNode || startNode, endNode ? Math.min(endOffset, endNode.textContent?.length || 0) : Math.min(startOffset, startNode.textContent?.length || 0));
      
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    saveCursorPosition();
    document.execCommand(command, false, value);
    onChange(editorRef.current.innerHTML);
    
    // Restore cursor position after a brief delay
    setTimeout(() => {
      restoreCursorPosition();
    }, 0);
  }, [onChange, saveCursorPosition, restoreCursorPosition]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (editorRef.current && !isUpdating) {
      saveCursorPosition();
      const content = editorRef.current.innerHTML;
      // Prevent empty content from being just <br> or <div><br></div>
      const cleanContent = content === '<br>' || content === '<div><br></div>' ? '' : content;
      onChange(cleanContent);
    }
  }, [onChange, saveCursorPosition, isUpdating]);

  // Update editor content when props change
  React.useEffect(() => {
    if (!editorRef.current || isUpdating) return;
    
    if (editorRef.current.innerHTML !== content) {
      setIsUpdating(true);
      saveCursorPosition();
      editorRef.current.innerHTML = content;
      // Focus the editor if it was previously focused
      const wasActive = document.activeElement === editorRef.current;
      setTimeout(() => {
        if (wasActive && editorRef.current) {
          editorRef.current.focus();
        }
        restoreCursorPosition();
        setIsUpdating(false);
      }, 0);
    }
  }, [content, saveCursorPosition, restoreCursorPosition, isUpdating]);

  // Initialize editor content on mount
  React.useEffect(() => {
    if (editorRef.current && content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const addImage = useCallback(() => {
    setShowImageUpload(true);
  }, []);

  const handleImageSelect = useCallback((url: string) => {
    execCommand('insertImage', url);
    if (onImageSelect) {
      onImageSelect(url);
    }
  }, [execCommand, onImageSelect]);

  const getWordCount = useCallback(() => {
    const text = editorRef.current?.textContent || '';
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  const getCharacterCount = useCallback(() => {
    return editorRef.current?.textContent?.length || 0;
  }, []);

  const toggleTextDirection = useCallback(() => {
    const newDirection = textDirection === 'ltr' ? 'rtl' : 'ltr';
    setTextDirection(newDirection);
    if (editorRef.current) {
      editorRef.current.style.direction = newDirection;
      editorRef.current.style.textAlign = newDirection === 'rtl' ? 'right' : 'left';
    }
  }, [textDirection]);

  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--background)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-[var(--border)] bg-[var(--surface)]">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border)]">
          <MenuButton
            onClick={() => execCommand('bold')}
            icon={Bold}
            title="Bold"
          />
          <MenuButton
            onClick={() => execCommand('italic')}
            icon={Italic}
            title="Italic"
          />
          <MenuButton
            onClick={() => execCommand('underline')}
            icon={UnderlineIcon}
            title="Underline"
          />
          <MenuButton
            onClick={() => execCommand('strikeThrough')}
            icon={Strikethrough}
            title="Strikethrough"
          />
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border)]">
          <select
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'p') {
                execCommand('formatBlock', 'div');
              } else {
                execCommand('formatBlock', value);
              }
            }}
            className="px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)]"
          >
            <option value="div">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border)]">
          <MenuButton
            onClick={() => execCommand('insertUnorderedList')}
            icon={List}
            title="Bullet List"
          />
          <MenuButton
            onClick={() => execCommand('insertOrderedList')}
            icon={ListOrdered}
            title="Ordered List"
          />
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border)]">
          <MenuButton
            onClick={() => execCommand('justifyLeft')}
            icon={AlignLeft}
            title="Align Left"
          />
          <MenuButton
            onClick={() => execCommand('justifyCenter')}
            icon={AlignCenter}
            title="Align Center"
          />
          <MenuButton
            onClick={() => execCommand('justifyRight')}
            icon={AlignRight}
            title="Align Right"
          />
          <MenuButton
            onClick={toggleTextDirection}
            icon={RotateCcw}
            title={`Switch to ${textDirection === 'ltr' ? 'RTL' : 'LTR'}`}
            isActive={textDirection === 'rtl'}
          />
        </div>

        {/* Advanced */}
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border)]">
          <MenuButton
            onClick={addLink}
            icon={LinkIcon}
            title="Add Link"
          />
          <MenuButton
            onClick={addImage}
            icon={ImageIcon}
            title="Add Image"
          />
          <MenuButton
            onClick={() => execCommand('formatBlock', 'pre')}
            icon={Code}
            title="Code Block"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => execCommand('undo')}
            icon={Undo}
            title="Undo"
          />
          <MenuButton
            onClick={() => execCommand('redo')}
            icon={Redo}
            title="Redo"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={editable}
          onInput={handleInput}
          onPaste={(e) => {
            e.preventDefault();
            const clipboardData = e.clipboardData;
            
            // Try to get HTML first, then fall back to plain text
            const htmlData = clipboardData.getData('text/html');
            const textData = clipboardData.getData('text/plain');
            
            if (htmlData) {
              // Clean HTML to prevent XSS and unwanted formatting
              const cleanHtml = htmlData
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<style[^>]*>.*?<\/style>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '')
                .replace(/javascript:/gi, '');
              document.execCommand('insertHTML', false, cleanHtml);
            } else {
              document.execCommand('insertText', false, textData);
            }
            
            // Trigger change event
            setTimeout(() => {
              if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
              }
            }, 0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              document.execCommand('indent');
            }
          }}
          suppressContentEditableWarning={true}
          dir={textDirection}
          className={`min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3
            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2
            [&_p]:mb-3 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3
            [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3
            [&_li]:mb-1
            [&_a]:text-[var(--primary)] [&_a]:underline
            [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-3
            [&_pre]:bg-[var(--surface)] [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[var(--border)] [&_pre]:font-mono [&_pre]:text-sm [&_pre]:overflow-x-auto
            text-[var(--foreground)] caret-[var(--primary)] selection:bg-[var(--primary)] selection:text-white
            ${textDirection === 'rtl' ? 'text-right' : 'text-left'} ${className}`}
          style={{ 
            minHeight: '300px',
            direction: textDirection,
            textAlign: textDirection === 'rtl' ? 'right' : 'left'
          }}
        />
        
        {!content && (
          <div className={`absolute top-4 pointer-events-none text-[var(--secondary)] text-sm ${
            textDirection === 'rtl' ? 'right-4' : 'left-4'
          }`}>
            {placeholder}
          </div>
        )}
      </div>

      {/* Character Count */}
      {showCharacterCount && (
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--secondary)] flex justify-between items-center">
          <div>
            {getCharacterCount()} characters, {getWordCount()} words
          </div>
          {maxCharacters && (
            <div className={`${
              getCharacterCount() > maxCharacters * 0.9 
                ? 'text-red-500' 
                : 'text-[var(--secondary)]'
            }`}>
              {getCharacterCount()}/{maxCharacters}
            </div>
          )}
        </div>
      )}

      {/* Image Upload Modal */}
      <ImageUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelect={handleImageSelect}
      />
    </div>
  );
};