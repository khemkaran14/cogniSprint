import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet } from "@/lib/api";

type Receipt = { number: string; orderId: string; providerOrderId?: string; providerPaymentId?: string; customerName: string; customerEmail: string; product: { name: string }; amount: number; currency: string; status: string; purchasedAt: string; refundedAt?: string };
export default function OrderReceiptPage() {
  const { user, loading } = useAuth(); const { id = "" } = useParams();
  const query = useQuery({ queryKey: ["order-receipt", id], queryFn: () => apiGet<{ receipt: Receipt }>(`/checkout/orders/${id}/receipt`), enabled: Boolean(user && id), retry: false });
  if (loading) return <LoadingState label="Loading receipt…" />;
  if (!user) return <Navigate to="/login" state={{ from: `/account/orders/${id}` }} replace />;
  if (query.isLoading) return <LoadingState label="Loading receipt…" />;
  if (!query.data) return <Container className="py-20"><h1 className="text-2xl font-semibold">Receipt not found</h1><Link className="mt-4 inline-block text-[var(--color-brand-blue)]" to="/account">Return to account</Link></Container>;
  const receipt = query.data.receipt;
  return <section className="py-12"><Seo title={`Receipt ${receipt.number}`} description="Your CogniSprint payment receipt." path={`/account/orders/${id}`} /><Container className="max-w-3xl"><div className="mb-6 flex flex-wrap justify-between gap-3 print:hidden"><Link className="font-semibold text-[var(--color-brand-blue)]" to="/account">← My account</Link><Button onClick={() => window.print()}><Download className="h-4 w-4" />Print or save PDF</Button></div><article className="surface-card bg-white p-8 text-slate-950 print:border-0 print:shadow-none"><p className="text-sm font-semibold uppercase tracking-widest text-blue-700">Payment receipt</p><h1 className="mt-3 text-3xl font-semibold">CogniSprint</h1><div className="mt-8 grid gap-5 border-y border-slate-200 py-6 sm:grid-cols-2"><div><p className="text-xs uppercase text-slate-500">Receipt number</p><p className="font-mono">{receipt.number}</p></div><div><p className="text-xs uppercase text-slate-500">Purchase date</p><p>{new Date(receipt.purchasedAt).toLocaleString()}</p></div><div><p className="text-xs uppercase text-slate-500">Customer</p><p>{receipt.customerName}<br />{receipt.customerEmail}</p></div><div><p className="text-xs uppercase text-slate-500">Payment reference</p><p className="break-all font-mono text-sm">{receipt.providerPaymentId ?? receipt.providerOrderId ?? receipt.orderId}</p></div></div><div className="mt-6 flex justify-between gap-4"><div><h2 className="font-semibold">{receipt.product.name}</h2><p className="text-sm capitalize text-slate-500">Payment status: {receipt.status}</p></div><p className="text-xl font-semibold">{receipt.currency} {(receipt.amount / 100).toFixed(2)}</p></div>{receipt.refundedAt ? <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm">Refund recorded {new Date(receipt.refundedAt).toLocaleString()}.</p> : null}<p className="mt-8 text-xs text-slate-500">This is a payment receipt, not a tax invoice. Tax invoice availability depends on finalized business and GST requirements.</p></article></Container></section>;
}
