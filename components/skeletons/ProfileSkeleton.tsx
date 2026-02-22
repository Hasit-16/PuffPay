import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
    return (
        <div className="min-h-screen pb-20">
            <div className="px-4 py-8 flex flex-col items-center">
                <Skeleton className="h-8 w-32 mb-8" />

                {/* Avatar */}
                <div className="relative mb-6">
                    <Skeleton className="w-32 h-32 rounded-full" />
                </div>

                {/* Info */}
                <div className="w-full max-w-sm space-y-4 mb-8">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>

                {/* Action */}
                <Skeleton className="h-12 w-full max-w-sm rounded-md" />
            </div>
        </div>
    );
}
