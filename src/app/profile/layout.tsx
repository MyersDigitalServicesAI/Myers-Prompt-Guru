import { AppHeader } from "@/components/app/header";
import { AppSidebar } from "@/components/app/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function ProfileLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                {children}
            </SidebarInset>
        </>
    );
  }
