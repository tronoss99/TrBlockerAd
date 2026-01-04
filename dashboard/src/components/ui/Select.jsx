import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Select({ value, onChange, options, placeholder, className, disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const selectedOption = options?.find(opt => opt.value === value)

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } })
    setIsOpen(false)
  }

  return (
    <>
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div ref={selectRef} className={cn('relative', isOpen && 'z-50', className)}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm',
            'transition-all duration-200 ease-in-out',
            'hover:border-primary/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isOpen && 'ring-2 ring-primary/20 border-primary'
          )}
        >
          <span className={cn(!selectedOption && 'text-muted-foreground')}>
            {selectedOption?.label || placeholder || 'Select...'}
          </span>
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </button>

        {isOpen && (
          <div className={cn(
            'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-xl',
            'animate-in fade-in-0 zoom-in-95 duration-100'
          )}>
            <div className="max-h-60 overflow-auto p-1">
              {options?.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm',
                    'transition-colors duration-150',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                    value === option.value && 'bg-primary/10 text-primary'
                  )}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Simple native select for forms where custom isn't needed
export function NativeSelect({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          'flex h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm',
          'transition-all duration-200 ease-in-out',
          'hover:border-primary/50',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
