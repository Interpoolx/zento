import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

/**
 * Reusable button component with multiple visual variants and sizes.
 * Provides consistent styling across the application with support for loading states.
 *
 * Features:
 * - 4 visual variants: primary (blue), secondary (gray), ghost (transparent), danger (red)
 * - 3 size options: sm (small), md (medium), lg (large)
 * - Automatic loading spinner with visual feedback
 * - Disabled state handling with reduced opacity and cursor changes
 * - Smooth transitions and focus states for accessibility
 *
 * Best practices:
 * - Use `primary` for main CTAs (Save, Create, Publish)
 * - Use `secondary` for alternative actions (Cancel, Skip)
 * - Use `ghost` for tertiary actions or icon buttons
 * - Use `danger` for destructive actions (Delete, Remove)
 * - Pair with `isLoading` during async operations to prevent double-clicks
 *
 * @param props - Button configuration
 * @param props.variant - Visual style (default: 'primary')
 *   - `'primary'`: Blue background, white text, main action style
 *   - `'secondary'`: Gray background, bordered, alternative action
 *   - `'ghost'`: Transparent, minimal styling, text-only appearance
 *   - `'danger'`: Red background, white text, for destructive actions
 * @param props.size - Button dimensions (default: 'md')
 *   - `'sm'`: Compact, use in tables or tight spaces (12px text)
 *   - `'md'`: Standard, use in most UI (14px text)
 *   - `'lg'`: Large, use for prominent actions (16px text)
 * @param props.isLoading - Shows spinner and disables button (default: false)
 * @param props.disabled - Disables interaction (default: false)
 * @param props.children - Button content (text, icons, fragments)
 * @param props.className - Additional Tailwind classes to apply/override
 * @returns Styled button element with full native button capabilities
 *
 * @example
 * // Primary action button
 * <Button variant="primary" size="lg">
 *   Create Widget
 * </Button>
 *
 * @example
 * // With icon (using lucide-react or similar)
 * import { Save } from 'lucide-react';
 * <Button variant="primary" className="gap-2">
 *   <Save className="w-4 h-4" />
 *   Save Changes
 * </Button>
 *
 * @example
 * // Async action with loading state
 * const [isDeleting, setIsDeleting] = useState(false);
 * const handleDelete = async () => {
 *   setIsDeleting(true);
 *   try {
 *     await deleteWidget(widgetId);
 *   } finally {
 *     setIsDeleting(false);
 *   }
 * };
 * <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
 *   Delete Widget
 * </Button>
 *
 * @example
 * // Button group with different variants
 * <div className="flex gap-2">
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="primary">Save</Button>
 * </div>
 *
 * @example
 * // Ghost button for subtle actions
 * <div className="flex items-center gap-1">
 *   <Button variant="ghost" size="sm">Reset</Button>
 *   <Button variant="ghost" size="sm">More Options</Button>
 * </div>
 *
 * @note All standard button attributes (onClick, onFocus, etc.) are supported
 * @note The component automatically handles focus ring for keyboard navigation
 *
 * @see ButtonProps interface for complete prop type definition
 */
export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4\" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Reusable input field component with integrated label and error messaging.
 * Provides consistent styling and validation feedback across the editor.
 *
 * Features:
 * - Optional label with proper accessibility
 * - Error state with red border and error text display
 * - Focus ring highlighting in primary color
 * - Disabled state with grayed-out appearance
 * - Placeholder text support
 * - Inherits all native input attributes
 *
 * Use for:
 * - Text input (name, URL, title, description)
 * - Email, password, number inputs
 * - Search fields
 * - Any form field in editor dialogs/panels
 *
 * @param props - Input field configuration
 * @param props.label - Optional label text displayed above input
 * @param props.error - Optional error message displayed below input in red
 * @param props.type - Input type: 'text', 'email', 'password', 'number', etc. (default: 'text')
 * @param props.value - Controlled input value
 * @param props.onChange - Called when input value changes
 * @param props.placeholder - Placeholder text when empty
 * @param props.disabled - Disables input interaction
 * @param props.className - Additional Tailwind classes
 * @returns Input field with optional label and error display
 *
 * @example
 * // Basic text input with label
 * const [value, setValue] = useState('');
 * <Input
 *   label="Page Title"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   placeholder="Enter page title"
 * />
 *
 * @example
 * // Email input with error state
 * const [email, setEmail] = useState('');
 * const [error, setError] = useState('');
 * <Input
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={error}
 * />
 *
 * @example
 * // URL input in widget properties
 * <Input
 *   label="Link URL"
 *   type="url"
 *   value={linkContent.url}
 *   onChange={(e) => updateWidget({ content: { ...content, url: e.target.value } })}
 *   placeholder="https://example.com"
 * />
 *
 * @example
 * // Number input with disabled state
 * <Input
 *   label="Widget Width"
 *   type="number"
 *   value={width}
 *   onChange={(e) => setWidth(Number(e.target.value))}
 *   disabled={isLocked}
 *   min="100"
 *   max="1200"
 * />
 *
 * @example
 * // Form validation example
 * const [formData, setFormData] = useState({ title: '', url: '' });
 * const [errors, setErrors] = useState({});
 *
 * const handleChange = (e) => {
 *   const { name, value } = e.target;
 *   setFormData(prev => ({ ...prev, [name]: value }));
 *   // Clear error when user starts typing
 *   if (errors[name]) {
 *     setErrors(prev => ({ ...prev, [name]: '' }));
 *   }
 * };
 *
 * <Input
 *   label="Widget Title"
 *   name="title"
 *   value={formData.title}
 *   onChange={handleChange}
 *   error={errors.title}
 * />
 *
 * @note The input always fills full width (w-full) for consistent layout
 * @note Focus state uses primary-500 color for consistency
 * @note Error text is small (text-sm) in red-600 color
 *
 * @see InputProps interface for complete type definitions
 */
export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

/**
 * Card container component with multiple visual variants.
 * Provides consistent spacing and styling for content grouping.
 *
 * @param props - Card properties including variant style
 * @returns Styled card container
 *
 * @example
 * <Card variant="elevated">
 *   <CardHeader>Title</CardHeader>
 *   <CardContent>Content here</CardContent>
 * </Card>
 */
export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border border-gray-200',
  };

  return (
    <div className={cn(variants[variant], 'rounded-xl', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card header subcomponent with top padding and bottom border.
 * Typically used with Card component for consistent structure.
 *
 * @param props - Div element properties
 * @returns Styled card header
 */
export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-100', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card content subcomponent with consistent padding.
 * Typically used with Card component for consistent structure.
 *
 * @param props - Div element properties
 * @returns Styled card content area
 */
export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Badge component for displaying small labels with color variants.
 * Commonly used for tags, status indicators, or category labels.
 *
 * @param props - Badge properties including color variant
 * @returns Styled badge element
 *
 * @example
 * <Badge color="green">Active</Badge>
 * <Badge color="red">Archived</Badge>
 */
export function Badge({ children, className, color = 'gray' }: { children: React.ReactNode; className?: string; color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[color], className)}>
      {children}
    </span>
  );
}

/**
 * Avatar component displaying a profile image or fallback initial.
 * Renders circular image or text fallback if image is unavailable.
 *
 * @param props - Avatar properties including src, alt, and fallback
 * @returns Circular avatar element
 *
 * @example
 * <Avatar src="profile.jpg" alt="User" fallback="JD" />
 */
export function Avatar({ src, alt, fallback, className }: { src?: string; alt?: string; fallback?: string; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-full bg-gray-200', className)}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
          {fallback?.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
}

/**
 * Tabbed interface component with active state management.
 * Supports optional icons alongside tab labels.
 *
 * @param props - Tabs properties including tabs array and change handler
 * @returns Styled tab navigation component
 *
 * @example
 * <Tabs
 *   tabs={[{ id: 'tab1', label: 'Tab 1' }, { id: 'tab2', label: 'Tab 2' }]}
 *   activeTab="tab1"
 *   onChange={(id) => setActiveTab(id)}
 * />
 */
export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Modal dialog component with overlay and close functionality.
 * Displays content in a centered modal with backdrop.
 *
 * @param props - Modal properties including open state and handlers
 * @returns Modal element or null if not open
 *
 * @example
 * <Modal isOpen={true} onClose={() => setOpen(false)} title="Confirm">
 *   Are you sure?
 * </Modal>
 */
export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full animate-scale-in">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
