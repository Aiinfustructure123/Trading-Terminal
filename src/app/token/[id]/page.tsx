import { TokenDetail } from "@/components/token/token-detail";

export default function TokenPage({ params }: { params: { id: string } }) {
  return <TokenDetail id={decodeURIComponent(params.id)} />;
}
