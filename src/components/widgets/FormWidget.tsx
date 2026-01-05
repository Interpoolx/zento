import React, { useState } from 'react';
import type { FormWidgetContent, FormField } from '@/types';
import { cn } from '@/lib/utils';

interface FormWidgetProps {
  content: FormWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Widget component for rendering dynamic, configurable forms with multiple field types.
 * 
 * Creates a fully functional form with validation, submission handling, and success states.
 * Supports dynamic field configuration allowing forms to be built via the editor without code.
 * 
 * Supported Field Types:
 * - `text` - Single-line text input
 * - `email` - Email input with browser validation
 * - `textarea` - Multi-line text input
 * - `checkbox` - Boolean checkbox with label
 * - `select` - Dropdown select with configurable options
 * 
 * Submission Behavior:
 * 1. Displays success message on submit
 * 2. After 2 seconds: redirects to `redirectUrl` if provided, otherwise resets form
 * 3. In production, integrate with backend API in `handleSubmit`
 * 
 * @component
 * @param {FormWidgetProps} props - Component configuration
 * @param {FormWidgetContent} props.content - Form structure and settings
 * @param {string} [props.content.title] - Form title displayed at top
 * @param {string} [props.content.description] - Explanatory text below title
 * @param {FormField[]} props.content.fields - Array of field configurations
 * @param {string} [props.content.submitText='Submit'] - Submit button text
 * @param {string} [props.content.successMessage='Thank you!'] - Success message
 * @param {string} [props.content.redirectUrl] - URL to redirect after submission
 * @param {React.CSSProperties} [props.style] - Custom container styles
 * @param {boolean} [props.isEditing=false] - Enables edit mode (prevents submission)
 * @param {() => void} [props.onClick] - Click handler for editor selection
 * @returns {React.ReactElement} Interactive form or success confirmation
 * 
 * @example
 * // Contact form with multiple field types
 * <FormWidget
 *   content={{
 *     title: "Contact Us",
 *     description: "We'd love to hear from you!",
 *     fields: [
 *       { id: 'name', type: 'text', label: 'Name', required: true },
 *       { id: 'email', type: 'email', label: 'Email', required: true },
 *       { id: 'subject', type: 'select', label: 'Subject', options: ['General', 'Support', 'Sales'] },
 *       { id: 'message', type: 'textarea', label: 'Message', placeholder: 'Your message...' },
 *       { id: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter' }
 *     ],
 *     submitText: "Send Message",
 *     successMessage: "Thanks! We'll be in touch soon."
 *   }}
 * />
 * 
 * @example
 * // Simple email signup with redirect
 * <FormWidget
 *   content={{
 *     title: "Join Our Newsletter",
 *     fields: [
 *       { id: 'email', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com' }
 *     ],
 *     submitText: "Subscribe",
 *     redirectUrl: "/thank-you"
 *   }}
 * />
 * 
 * @note In edit mode, click events are captured to prevent accidental form interactions
 * @see FormField for individual field configuration options
 * @see FormWidgetContent for full content type definition
 */
export function FormWidget({ content, style, isEditing, onClick }: FormWidgetProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  /**
   * Updates the form data state when a field value changes.
   * @param fieldId - The ID of the field being updated
   * @param value - The new value for the field
   */
  const handleChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  /**
   * Handles form submission, shows success state, and optionally redirects.
   * @param e - The form submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, send to backend
    setTimeout(() => {
      if (content.redirectUrl) {
        window.location.href = content.redirectUrl;
      } else {
        setSubmitted(false);
        setFormData({});
      }
    }, 2000);
  };

  /**
   * Renders the appropriate input element based on field type.
   * @param field - The field configuration object
   * @returns The rendered form input element
   */
  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      name: field.id,
      value: formData[field.id] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleChange(field.id, e.target.value),
      disabled: submitted,
      className: cn(
        'w-full px-3 py-2 rounded-lg border border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        'disabled:bg-gray-100 disabled:text-gray-500',
        'transition-colors'
      ),
    };

    switch (field.type) {
      case 'text':
        return <input type="text" placeholder={field.placeholder} {...commonProps} required={field.required} />;
      case 'email':
        return <input type="email" placeholder={field.placeholder} {...commonProps} required={field.required} />;
      case 'textarea':
        return <textarea placeholder={field.placeholder} rows={4} {...commonProps} required={field.required} />;
      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input type="checkbox" {...commonProps} required={field.required} />
            <span>{field.label}</span>
          </label>
        );
      case 'select':
        return (
          <select {...commonProps} required={field.required}>
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
    }
  };

  return (
    <div
      className={cn('flex flex-col h-full p-6', isEditing && 'ring-2 ring-primary-500/20')}
      style={style}
      onClick={onClick}
      onClickCapture={e => isEditing && e.stopPropagation()}
    >
      {submitted ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-4xl mb-4">✓</div>
          <h3 className="font-bold text-lg mb-2">{content.successMessage || 'Thank you!'}</h3>
          <p className="text-sm opacity-70">We have received your submission</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          {content.title && <h3 className="font-bold text-lg">{content.title}</h3>}
          {content.description && <p className="text-sm opacity-70 mb-4">{content.description}</p>}

          <div className="flex-1 overflow-y-auto space-y-4">
            {content.fields.map(field => (
              <div key={field.id}>
                {field.type !== 'checkbox' && <label className="block text-sm font-medium mb-1">{field.label}</label>}
                {renderField(field)}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className={cn(
              'w-full px-4 py-2 rounded-lg font-semibold',
              'bg-primary-500 text-white hover:bg-primary-600',
              'transition-colors disabled:opacity-50',
              'mt-auto'
            )}
            disabled={submitted}
          >
            {content.submitText || 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
}
