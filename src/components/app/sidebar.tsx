'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Book,
  BotMessageSquare,
  ChevronDown,
  History,
  Home,
  LifeBuoy,
  Plus,
  Settings,
  Sparkles,
  SquareUser,
  Triangle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { AppLogo } from './app-logo';
import { AddPromptDialog } from './add-prompt-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';

const categories = [
  { name: 'Creative', icon: Sparkles },
  { name: 'Technical', icon: Triangle },
  { name: 'Marketing', icon: BotMessageSquare },
  { name: 'Health', icon: LifeBuoy },
  { name: 'Lifestyle', icon: Home },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCategoriesOpen, setIsCategoriesOpen] = React.useState(true);
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  return (
    <Sidebar>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
            <AddPromptDialog>
                <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Prompt
                </Button>
            </AddPromptDialog>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/" isActive={pathname === '/'} tooltip="Home">
              <Home />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/library" isActive={pathname === '/library'} tooltip="My Library">
              <Book />
              <span>My Library</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/history" isActive={pathname === '/history'} tooltip="History">
              <History />
              <span>History</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <div className="p-2">
          <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex w-full items-center justify-between">
                <span className="px-2 text-xs font-medium text-muted-foreground">Categories</span>
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', isCategoriesOpen && 'rotate-180')}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="mt-2">
                {categories.map(category => (
                  <SidebarMenuSubItem key={category.name}>
                    <SidebarMenuSubButton href={`/category/${category.name.toLowerCase()}`}>
                      <category.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{category.name}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/settings" tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/profile" tooltip="Profile">
                <div className='flex items-center gap-2'>
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={user?.photoURL ?? userAvatar?.imageUrl} alt={user?.displayName ?? "User Avatar"} />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user?.displayName || 'User'}</span>
                </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
