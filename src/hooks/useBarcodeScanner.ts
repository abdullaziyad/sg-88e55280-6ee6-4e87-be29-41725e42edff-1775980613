import { useEffect, useRef, useCallback } from "react";

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
  minLength?: number;
  maxLength?: number;
  scanTimeout?: number;
  enabled?: boolean;
}

export function useBarcodeScanner({
  onScan,
  onError,
  minLength = 8,
  maxLength = 20,
  scanTimeout = 100,
  enabled = true,
}: BarcodeScannerOptions) {
  const bufferRef = useRef("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeyTimeRef = useRef<number>(0);

  const resetBuffer = useCallback(() => {
    bufferRef.current = "";
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const processBuffer = useCallback(() => {
    const barcode = bufferRef.current.trim();
    
    if (barcode.length >= minLength && barcode.length <= maxLength) {
      // Valid barcode detected
      onScan(barcode);
    } else if (barcode.length > 0 && barcode.length < minLength) {
      // Too short to be a barcode
      onError?.(`Barcode too short: ${barcode}`);
    }
    
    resetBuffer();
  }, [minLength, maxLength, onScan, onError, resetBuffer]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;

      // If Enter key is pressed, process the buffer
      if (event.key === "Enter") {
        event.preventDefault();
        processBuffer();
        return;
      }

      // Ignore special keys (except numbers and letters)
      if (event.key.length > 1 && event.key !== "Enter") {
        return;
      }

      // If too much time has passed since last key, reset buffer
      if (timeDiff > scanTimeout && bufferRef.current.length > 0) {
        resetBuffer();
      }

      // Add character to buffer
      if (event.key.length === 1) {
        event.preventDefault();
        bufferRef.current += event.key;
        lastKeyTimeRef.current = currentTime;

        // Auto-process if buffer exceeds max length
        if (bufferRef.current.length > maxLength) {
          resetBuffer();
          onError?.("Barcode too long");
          return;
        }

        // Set timeout to auto-process buffer
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          processBuffer();
        }, scanTimeout);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      resetBuffer();
    };
  }, [enabled, processBuffer, resetBuffer, scanTimeout, maxLength, onError]);

  return { resetBuffer };
}