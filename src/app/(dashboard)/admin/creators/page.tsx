import { PageHeader } from "@/components/dashboard/PageHeader";
import { CreatorAdminActions } from "@/components/admin/CreatorAdminActions";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getAdminCreators } from "@/lib/creator-program";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";

export default async function AdminCreatorsPage() {
  const creators = await getAdminCreators();

  return (
    <>
      <PageHeader
        title="Creators"
        description="Approve creators, verify profiles, and review seller accounts."
      />

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Creator</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Products</th>
                  <th className="pb-3 pr-4 font-medium">Earnings</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((creator) => (
                  <tr key={creator.id} className="border-b border-border/50">
                    <td className="py-4 pr-4">
                      <Link
                        href={`/creators/${creator.user.username}`}
                        className="font-medium hover:text-electric"
                      >
                        {creator.displayName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        @{creator.user.username} · {creator.user.email}
                      </p>
                      {creator.verified && (
                        <Badge variant="electric" className="mt-1">
                          Verified
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 pr-4 capitalize">{creator.creatorStatus}</td>
                    <td className="py-4 pr-4">{creator.user._count.prompts}</td>
                    <td className="py-4 pr-4">
                      {formatCurrency(creator.totalEarnings)}
                    </td>
                    <td className="py-4">
                      <CreatorAdminActions
                        userId={creator.userId}
                        creatorStatus={creator.creatorStatus}
                        verified={creator.verified}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
