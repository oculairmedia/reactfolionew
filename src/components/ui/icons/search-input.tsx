"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import MagnifierIcon from "@/icons/magnifier-icon";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export interface SearchInputRef {
  focus: () => void;
}

const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "Search icons...",
      className,
      autoFocus = false,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && value) {
          onChange("");
          inputRef.current?.focus();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [value, onChange]);

    const handleClear = () => {
      onChange("");
      inputRef.current?.focus();
    };

    return (
      <motion.div
        className={cn("relative flex w-full items-center", className)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Glow effect on focus */}
        <motion.div
          className="bg-primary/20 absolute inset-0 -z-10 rounded-xl blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 0.5 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Main container */}
        <div
          className={cn(
            "relative flex w-full items-center gap-3 px-4 py-3",
            "bg-background rounded-xl border",
            "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]",
            "dark:bg-muted/30 dark:border-white/10",
            "transition-all duration-300 ease-out",
            isFocused && "border-primary/50 dark:border-primary/30 shadow-md",
          )}
        >
          {/* Search icon */}
          <motion.div
            animate={{
              scale: isFocused ? 1.1 : 1,
              rotate: isFocused ? -5 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-muted-foreground flex items-center justify-center"
          >
            <MagnifierIcon
              size={20}
              className={cn(
                "transition-colors duration-200",
                isFocused ? "text-primary" : "text-muted-foreground",
              )}
            />
          </motion.div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              "text-foreground flex-1 bg-transparent text-sm",
              "placeholder:text-muted-foreground/60",
              "border-none outline-none",
              "transition-all duration-200",
            )}
          />

          {/* Clear button */}
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={handleClear}
                className={cn(
                  "rounded-md p-1",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-muted/50",
                  "transition-colors duration-150",
                )}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Keyboard hint */}
          <AnimatePresence>
            {value && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="border-border hidden items-center gap-1.5 border-l pl-3 sm:flex"
              >
                <kbd className="text-muted-foreground bg-muted/50 rounded px-2 py-0.5 font-mono text-xs">
                  esc
                </kbd>
                <span className="text-muted-foreground text-xs">to clear</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="via-primary/50 absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-linear-to-r from-transparent to-transparent"
          initial={{ width: "0%" }}
          animate={{ width: isFocused ? "80%" : "0%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
