'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit,
  FileText,
  Type,
  Hash,
  Quote,
  Minus,
  Table
} from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface MarkdownRichEditorProps {
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
  mode?: 'markdown' | 'wysiwyg';
}

const MenuButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  label?: string;
}> = ({ onClick, isActive, disabled, icon: Icon, title, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
      isActive
        ? 'bg-[var(--primary)] text-white shadow-sm'
        : 'bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--foreground)] hover:shadow-sm'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
  >
    <Icon size={16} className="flex-shrink-0" />
    {label && <span className="hidden sm:inline">{label}</span>}
  </button>
);

// Markdown to HTML converter
const markdownToHtml = (markdown: string): string => {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>');
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img alt="$1" src="$2" class="max-w-full h-auto rounded-lg my-3" />');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[var(--border)] pl-4 py-2 my-3 bg-[var(--surface)]">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="border-[var(--border)] my-6" />');
  html = html.replace(/^\*\*\*$/gim, '<hr class="border-[var(--border)] my-6" />');

  // Lists
  const processLists = (text: string): string => {
    // Unordered lists
    text = text.replace(/^\* (.*$)/gim, '<li>$1</li>');
    text = text.replace(/^- (.*$)/gim, '<li>$1</li>');
    text = text.replace(/^\+ (.*$)/gim, '<li>$1</li>');
    
    // Ordered lists
    text = text.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Wrap consecutive list items in ul/ol tags
    text = text.replace(/(<li>.*<\/li>)/gim, (match) => {
      // Check if already wrapped
      if (match.includes('<ul>') || match.includes('<ol>')) {
        return match;
      }
      return `<ul>${match}</ul>`;
    });
    
    return text;
  };

  html = processLists(html);

  // Tables (basic support)
  const processTable = (text: string): string => {
    const lines = text.split('\n');
    let inTable = false;
    let tableHtml = '';
    let result = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('|') && line.trim() !== '') {
        if (!inTable) {
          inTable = true;
          tableHtml = '<table class="border-collapse border border-[var(--border)] w-full my-4"><tbody>';
        }
        
        const cells = line.split('|').filter(cell => cell.trim() !== '');
        const isHeader = i + 1 < lines.length && lines[i + 1].includes('---');
        
        tableHtml += `<tr>`;
        cells.forEach(cell => {
          const tag = isHeader ? 'th' : 'td';
          tableHtml += `<${tag} class="border border-[var(--border)] px-3 py-2">${cell.trim()}</${tag}>`;
        });
        tableHtml += '</tr>';
        
        // Skip separator line
        if (isHeader && i + 1 < lines.length && lines[i + 1].includes('---')) {
          i++;
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table>';
          result += tableHtml + '\n';
          tableHtml = '';
        }
        result += line + '\n';
      }
    }
    
    if (inTable) {
      tableHtml += '</tbody></table>';
      result += tableHtml;
    }
    
    return result;
  };

  html = processTable(html);

  // Line breaks and paragraphs
  html = html.replace(/\n\n/gim, '</p><p>');
  html = html.replace(/\n/gim, '<br>');

  // Wrap in paragraphs (avoid wrapping block elements)
  const blockElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote', 'ul', 'ol', 'table', 'hr'];
  let wrappedHtml = html;
  
  // Only wrap text that isn't already in block elements
  if (!blockElements.some(tag => html.includes(`<${tag}`))) {
    wrappedHtml = `<p>${html}</p>`;
  }

  // Clean up empty paragraphs and fix block element wrapping
  wrappedHtml = wrappedHtml.replace(/<p><\/p>/gim, '');
  wrappedHtml = wrappedHtml.replace(/<p>(<(?:h[1-6]|pre|blockquote|ul|ol|table|hr)[^>]*>)/gim, '$1');
  wrappedHtml = wrappedHtml.replace(/(<\/(?:h[1-6]|pre|blockquote|ul|ol|table|hr)>)<\/p>/gim, '$1');

  return wrappedHtml;
};

// HTML to markdown converter (simplified)
const htmlToMarkdown = (html: string): string => {
  let markdown = html;

  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gim, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gim, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gim, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gim, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gim, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gim, '###### $1\n\n');

  // Bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gim, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gim, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gim, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gim, '*$1*');

  // Strikethrough
  markdown = markdown.replace(/<del[^>]*>(.*?)<\/del>/gim, '~~$1~~');

  // Links
  markdown = markdown.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gim, '[$2]($1)');

  // Images
  markdown = markdown.replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gim, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]+alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gim, '![$1]($2)');
  markdown = markdown.replace(/<img[^>]+src="([^"]*)"[^>]*\/?>/gim, '![]($1)');

  // Code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gim, '```\n$1\n```\n');
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gim, '`$1`');

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gim, '> $1\n');

  // Lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gims, '$1');
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gims, '$1');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gim, '- $1\n');

  // Line breaks and paragraphs
  markdown = markdown.replace(/<br\s*\/?>/gim, '\n');
  markdown = markdown.replace(/<\/p>\s*<p[^>]*>/gim, '\n\n');
  markdown = markdown.replace(/<p[^>]*>/gim, '');
  markdown = markdown.replace(/<\/p>/gim, '\n\n');

  // Horizontal rules
  markdown = markdown.replace(/<hr[^>]*\/?>/gim, '\n---\n');

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/gim, '\n\n');
  markdown = markdown.trim();

  return markdown;
};

export const MarkdownRichEditor: React.FC<MarkdownRichEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  editable = true,
  showCharacterCount = true,
  maxCharacters = 10000,
  onImageSelect,
  mode: initialMode = 'markdown'
}) => {
  const [mode, setMode] = useState<'markdown' | 'wysiwyg' | 'preview'>(initialMode);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(
    mode === 'wysiwyg' ? htmlToMarkdown(content) : content
  );

  // Convert content based on current mode
  const displayContent = useMemo(() => {
    if (mode === 'markdown') {
      return markdownContent;
    } else if (mode === 'preview') {
      return markdownToHtml(markdownContent);
    } else {
      // WYSIWYG mode
      return markdownToHtml(markdownContent);
    }
  }, [markdownContent, mode]);

  const handleContentChange = useCallback((newContent: string) => {
    setMarkdownContent(newContent);
    
    // Always store as HTML for consistency with backend
    const htmlContent = markdownToHtml(newContent);
    onChange(htmlContent);
  }, [onChange]);

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    const newContent = markdownContent.substring(0, start) + before + selectedText + after + markdownContent.substring(end);
    
    handleContentChange(newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  }, [markdownContent, handleContentChange]);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = markdownContent.substring(0, start) + text + markdownContent.substring(end);
    
    handleContentChange(newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [markdownContent, handleContentChange]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    const linkText = window.prompt('Enter link text:', 'Link');
    if (url && linkText) {
      insertMarkdown(`[${linkText}](`, `${url})`);
    }
  }, [insertMarkdown]);

  const addImage = useCallback(() => {
    setShowImageUpload(true);
  }, []);

  const handleImageSelect = useCallback((url: string) => {
    const altText = window.prompt('Enter image description (optional):') || 'Image';
    insertAtCursor(`![${altText}](${url})`);
    if (onImageSelect) {
      onImageSelect(url);
    }
  }, [insertAtCursor, onImageSelect]);

  const addTable = useCallback(() => {
    const tableMarkdown = `
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`;
    insertAtCursor(tableMarkdown);
  }, [insertAtCursor]);

  const getWordCount = useCallback(() => {
    const text = markdownContent.replace(/[#*`>\-\[\]()]/g, '').trim();
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }, [markdownContent]);

  const getCharacterCount = useCallback(() => {
    return markdownContent.length;
  }, [markdownContent]);

  // Update markdown content when content prop changes
  React.useEffect(() => {
    if (mode === 'wysiwyg' && content !== markdownToHtml(markdownContent)) {
      setMarkdownContent(htmlToMarkdown(content));
    } else if (mode === 'markdown' && content !== markdownToHtml(markdownContent)) {
      // Try to detect if content is HTML or markdown
      const isHtml = content.includes('<') && content.includes('>');
      setMarkdownContent(isHtml ? htmlToMarkdown(content) : content);
    }
  }, [content, mode, markdownContent]);

  return (
    <div className={`border border-[var(--border)] rounded-lg bg-[var(--background)] ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-[var(--border)] bg-[var(--surface)]">
        {/* Mode Toggle */}
        <div className="flex items-center gap-1.5 pr-3 mr-1 border-r border-[var(--border)]">
          <MenuButton
            onClick={() => setMode('markdown')}
            icon={Edit}
            title="Markdown Mode"
            label="Markdown"
            isActive={mode === 'markdown'}
          />
          <MenuButton
            onClick={() => setMode('wysiwyg')}
            icon={Type}
            title="Visual Editor"
            label="Visual"
            isActive={mode === 'wysiwyg'}
          />
          <MenuButton
            onClick={() => setMode('preview')}
            icon={Eye}
            title="Preview"
            label="Preview"
            isActive={mode === 'preview'}
          />
        </div>

        {mode === 'markdown' && (
          <>
            {/* Text Formatting */}
            <div className="flex items-center gap-1.5 pr-3 mr-1 border-r border-[var(--border)]">
              <MenuButton
                onClick={() => insertMarkdown('**', '**')}
                icon={Bold}
                title="Bold (**text**)"
                label="Bold"
              />
              <MenuButton
                onClick={() => insertMarkdown('*', '*')}
                icon={Italic}
                title="Italic (*text*)"
                label="Italic"
              />
              <MenuButton
                onClick={() => insertMarkdown('`', '`')}
                icon={Code}
                title="Code (`code`)"
                label="Code"
              />
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1.5 pr-3 mr-1 border-r border-[var(--border)]">
              <MenuButton
                onClick={() => insertMarkdown('# ', '')}
                icon={Hash}
                title="Heading 1"
                label="H1"
              />
              <MenuButton
                onClick={() => insertMarkdown('## ', '')}
                icon={Hash}
                title="Heading 2"
                label="H2"
              />
              <MenuButton
                onClick={() => insertMarkdown('### ', '')}
                icon={Hash}
                title="Heading 3"
                label="H3"
              />
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1.5 pr-3 mr-1 border-r border-[var(--border)]">
              <MenuButton
                onClick={() => insertMarkdown('- ', '')}
                icon={List}
                title="Bullet List"
                label="List"
              />
              <MenuButton
                onClick={() => insertMarkdown('1. ', '')}
                icon={ListOrdered}
                title="Numbered List"
                label="Ordered"
              />
            </div>

            {/* Advanced */}
            <div className="flex items-center gap-1.5">
              <MenuButton
                onClick={addLink}
                icon={LinkIcon}
                title="Add Link"
                label="Link"
              />
              <MenuButton
                onClick={addImage}
                icon={ImageIcon}
                title="Add Image"
                label="Image"
              />
              <MenuButton
                onClick={() => insertMarkdown('> ', '')}
                icon={Quote}
                title="Blockquote"
                label="Quote"
              />
              <MenuButton
                onClick={() => insertAtCursor('\n---\n')}
                icon={Minus}
                title="Horizontal Rule"
                label="HR"
              />
              <MenuButton
                onClick={addTable}
                icon={Table}
                title="Insert Table"
                label="Table"
              />
            </div>
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className="relative">
        {mode === 'markdown' ? (
          <textarea
            value={markdownContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={placeholder}
            readOnly={!editable}
            className="w-full min-h-[300px] p-4 resize-none focus:outline-none bg-transparent text-[var(--foreground)] font-mono text-sm leading-relaxed"
            style={{ minHeight: '300px' }}
          />
        ) : mode === 'preview' ? (
          <div
            className="min-h-[300px] p-4 prose prose-sm max-w-none
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
              [&_code]:bg-[var(--surface)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
              [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:bg-[var(--surface)]
              [&_table]:border-collapse [&_table]:border [&_table]:border-[var(--border)] [&_table]:w-full [&_table]:my-4
              [&_th]:border [&_th]:border-[var(--border)] [&_th]:px-3 [&_th]:py-2 [&_th]:bg-[var(--surface)] [&_th]:font-bold
              [&_td]:border [&_td]:border-[var(--border)] [&_td]:px-3 [&_td]:py-2
              [&_hr]:border-[var(--border)] [&_hr]:my-6
              text-[var(--foreground)]"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        ) : (
          // WYSIWYG mode - use the existing RichTextEditor content
          <div
            contentEditable={editable}
            onInput={(e) => {
              const htmlContent = e.currentTarget.innerHTML;
              const markdown = htmlToMarkdown(htmlContent);
              setMarkdownContent(markdown);
              onChange(htmlContent);
            }}
            suppressContentEditableWarning={true}
            className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none
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
              text-[var(--foreground)] caret-[var(--primary)]"
            style={{ minHeight: '300px' }}
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        )}

        {!markdownContent && mode === 'markdown' && (
          <div className="absolute top-4 left-4 pointer-events-none text-[var(--secondary)] text-sm">
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