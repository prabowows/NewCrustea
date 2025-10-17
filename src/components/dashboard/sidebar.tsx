"use client"

import { useTheme } from "next-themes";
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Home, Settings, BarChart, Bell } from "lucide-react";

export function AppSidebar() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <>
      <SidebarHeader>
        <h2 className="text-lg font-semibold">Settings</h2>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" isActive>
              <Home />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <BarChart />
              Analytics
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <Bell />
              Alarms
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <Settings />
              Device Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
            <Label htmlFor="theme-switch" className="flex items-center gap-2">
                {theme === 'dark' ? <Moon /> : <Sun />}
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </Label>
            <Switch 
                id="theme-switch" 
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
            />
        </div>
      </SidebarFooter>
    </>
  );
}
