import ProfilePageClient from "@/components/ProfilePageClient";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <ProfilePageClient userId={userId} />;
}
