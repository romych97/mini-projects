"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const ShortcutInput = ({ value, modifiers, onChange }) => {
  const [pressedKeys, setPressedKeys] = useState([]);

  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [currentShortcut, setCurrentShortcut] = useState(value);
  const [pendingShortcut, setPendingShortcut] = useState(null);
  const [lastValidShortcut, setLastValidShortcut] = useState(value);

  const containerRef = useRef(null);

  const isModifierKey = (key, modifiers) =>
    modifiers.some((mod) => mod.toLowerCase() === key.toLowerCase());

  const isValidNonModifierKey = (key, modifiers) =>
    key.length === 1 &&
    /^[\x00-\x7F]$/.test(key) &&
    !isModifierKey(key, modifiers);

  const parseShortcut = useCallback(
    (keys) => {
      const mods = keys.filter((k) => isModifierKey(k, modifiers));
      const nonMods = keys.filter((k) => isValidNonModifierKey(k, modifiers));
      return mods.length && nonMods.length === 1
        ? [...mods, ...nonMods].join("+")
        : null;
    },
    [modifiers]
  );

  const handleKeyDown = useCallback(
    (e) => {
      e.preventDefault();
      const key = e.key === " " ? "Space" : e.key;

      setPressedKeys((prev) => {
        const newKeys = Array.from(new Set([...prev, key]));
        const shortcut = parseShortcut(newKeys);

        if (shortcut) {
          setPendingShortcut(shortcut);
        }

        return newKeys;
      });
    },
    [parseShortcut]
  );

  const handleKeyUp = useCallback(
    (e) => {
      const key = e.key === " " ? "Space" : e.key;

      setPressedKeys((prev) => {
        const newKeys = prev.filter((k) => k !== key);

        if (newKeys.length === 0) {
          setIsValid(false);
          if (!lastValidShortcut) {
            setCurrentShortcut("");
          }
        }

        return newKeys;
      });
    },
    [lastValidShortcut]
  );

  useEffect(() => {
    if (pendingShortcut) {
      setCurrentShortcut(pendingShortcut);
      setLastValidShortcut(pendingShortcut);
      setIsValid(true);
      onChange(pendingShortcut);
      setPendingShortcut(null);
    }
  }, [pendingShortcut, onChange]);

  useEffect(() => {
    setCurrentShortcut(value);
    setLastValidShortcut(value);
    setIsValid(!!value);
  }, [value]);

  useEffect(() => {
    if (isFocused) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      setPressedKeys([]);
      if (!isValid) {
        setCurrentShortcut(lastValidShortcut || "");
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isFocused, isValid, handleKeyDown, handleKeyUp, lastValidShortcut]);

  const getBorderColor = () => {
    if (pressedKeys.length > 0) return "border-gray-300";
    if (isValid) return "border-blue-500";
    if (isFocused) return "border-blue-500";
    return "border-gray-300";
  };

  const displayValue =
    pressedKeys.length > 0 && !lastValidShortcut
      ? pressedKeys.join(" ")
      : lastValidShortcut || currentShortcut || "Press shortcut";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        if (!isValid) {
          setCurrentShortcut(lastValidShortcut || "");
        }
      }}
      className={`${getBorderColor()} p-4 border-2 rounded-lg bg-white text-gray-800 min-w-[200px] text-center transition-colors duration-200 outline-none`}
    >
      {displayValue}
    </div>
  );
};

export default ShortcutInput;
