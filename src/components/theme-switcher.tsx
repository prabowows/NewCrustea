"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="theme-switch" className="flex items-center gap-2">
        {theme === 'dark' ? <Moon /> : <Sun />}
        <span className="text-sm font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
      </Label>
      <Switch 
        id="theme-switch" 
        checked={theme === 'dark'}
        onCheckedChange={handleThemeChange}
      />
    </div>
  );
}
