export type DropdownOption<T> = {
  value: T;
  label: string;
  display?: React.ReactNode;
};

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";

interface GenericSelectProps<T> {
  options: DropdownOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  placeholder?: string;
  renderButtonContent?: (selectedOption: DropdownOption<T> | null) => React.ReactNode;
  renderOptionContent?: (option: DropdownOption<T>, isSelected: boolean) => React.ReactNode;
  containerClassName?: string;
  buttonClassName?: string;
  listboxClassName?: string;
  optionClassName?: string;
  /**
   * Main class name for the root container of the component.
   * This will be applied to the div that wraps the button and the listbox.
   */
  dropdownStyle?: string; // Add this to the interface
  dropdownOpenStyle?: string;
}

export default function GenericSelect<T>({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select...",
  renderButtonContent,
  renderOptionContent,
  // Default values for internal class names
  dropdownOpenStyle,
  listboxClassName = `absolute left-0 bottom-12 mt-1 w-full rounded-xs bg-gray-50 z-60 p-0  shadow-lg ease-in-out duration-200 ${dropdownOpenStyle || ''} `,
  optionClassName = "cursor-pointer select-none px-4 py-2 flex items-center space-x-1 text-sm",
  // Extracting className and defining default for other props
  dropdownStyle, // Extract className here
  containerClassName = `relative inline-block text-left w-full ${dropdownStyle || ''}`, // Combine with className
  buttonClassName = `dropdown ${dropdownStyle || ''}`,
}: GenericSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const listboxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        listboxRef.current &&
        !listboxRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const onButtonKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      const firstOption = listboxRef.current?.querySelector(
        '[role="option"]'
      ) as HTMLElement | null;
      firstOption?.focus();
    }
  }, []);

  const onOptionKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, index: number, optionValue: T) => {
      const allOptions = listboxRef.current?.querySelectorAll('[role="option"]');
      if (!allOptions) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = allOptions[(index + 1) % allOptions.length] as HTMLElement;
        next.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev =
          allOptions[(index - 1 + allOptions.length) % allOptions.length] as HTMLElement;
        prev.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (optionValue !== selectedValue) {
          onSelect(optionValue);
        }
        setOpen(false);
        buttonRef.current?.focus();
      }
    },
    [selectedValue, onSelect]
  );

  const handleSelect = useCallback((value: T) => {
    if (value !== selectedValue) {
      onSelect(value);
    }
    setOpen(false);
    buttonRef.current?.focus();
  }, [selectedValue, onSelect]);

  const selectedOption = options.find((opt) => opt.value === selectedValue) || null;

  return (
    <div className={containerClassName}> {/* containerClassName now includes the main className prop */}
      <button
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="generic-select-label"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        className={`${buttonClassName} rounded-xs  focus:ring-2 ring-blue-300`} 
      >
        {renderButtonContent ? (
          renderButtonContent(selectedOption)
        ) : (
          <div className="flex items-center ">
            {selectedOption?.display && (
              <span className="mr-2 text-xl leading-none">
                {selectedOption.display}
              </span>
            )}
            <span id="generic-select-label">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
        )}

        <div>
          <svg
            className="ml-2 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={selectedOption ? `option-${selectedOption.value}` : undefined}
          className={`${listboxClassName} `}
        >
          {options.map((option, i) => {
            const active = option.value === selectedValue;
            return (
              <div
                id={`option-${option.value}`}
                key={String(option.value)}
                role="option"
                tabIndex={0}
                aria-selected={active}
                onClick={() => handleSelect(option.value)}
                onKeyDown={(e) => onOptionKeyDown(e, i, option.value)}
                className={`${optionClassName} py-2.5 ${active ? "bg-blue-200 text-blue-600" : "text-gray-900"} ${i===0 ? "rounded-t-xs" : ""} ${i===options.length-1 ? "rounded-b-xs" : ""}`}
              >
                {renderOptionContent ? (
                  renderOptionContent(option, active)
                ) : (
                  <>
                    {option.display && (
                      <span className="text-lg leading-none">
                        {option.display}
                      </span>
                    )}
                    <span>{option.label}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}