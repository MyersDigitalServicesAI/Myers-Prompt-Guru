'use client';

import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { GoProDialog } from "@/components/app/go-pro-dialog";

function ProfileLoading() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
            <div className="flex items-center gap-4">
                 <Skeleton className="h-24 w-24 rounded-full" />
                 <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-64" />
                 </div>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    const { user, userProfile, isUserLoading } = useUser();
    const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

    if(isUserLoading) {
        return <ProfileLoading />
    }

    if (!user || !userProfile) {
        return <div className="p-8">Please log in to view your profile.</div>
    }

    return (
        <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={user.photoURL ?? userAvatar?.imageUrl} alt={user.displayName ?? "User Avatar"} />
                    <AvatarFallback className="text-3xl">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{user.displayName || "Anonymous User"}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Manage your PromptMaster subscription.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border p-6">
                    <div>
                        <h3 className="font-semibold">Current Plan</h3>
                        {userProfile.isPro ? (
                            <Badge className="mt-1" variant="default">Pro Plan</Badge>
                        ) : (
                            <Badge className="mt-1" variant="outline">Free Plan</Badge>
                        )}
                    </div>
                    {!userProfile.isPro && (
                        <GoProDialog>
                            <Button><Sparkles className="mr-2 h-4 w-4" />Upgrade to Pro</Button>
                        </GoProDialog>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}