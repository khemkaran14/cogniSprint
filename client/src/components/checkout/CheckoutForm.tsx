import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tag } from "lucide-react";
import { Input, Label, FieldError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { PaymentStatus } from "@/components/checkout/PaymentStatus";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/loadRazorpayScript";
import type { Product } from "@/types/content";
import { useAuth } from "@/auth/AuthContext";

const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(15, "Enter a valid phone number").regex(/^[0-9+\s-]+$/, "Enter a valid phone number"),
  acceptedTerms: z.boolean().refine((v) => v === true, { message: "You must accept the terms to continue" }),
});
type CustomerInput = z.infer<typeof customerSchema>;

type OrderState =
  | { phase: "form" }
  | { phase: "processing" }
  | { phase: "failed"; message?: string }
  | { phase: "unavailable"; message?: string };

type CouponPreview = { code: string; discountType: "flat" | "percentage"; discountValue: number };

export function CheckoutForm({ product }: { product: Product }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const price = product.price!;
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [orderState, setOrderState] = useState<OrderState>({ phase: "form" });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", phone: "", acceptedTerms: false },
  });

  useEffect(() => {
    if (!user) return;
    setValue("name", user.name);
    setValue("email", user.email);
  }, [setValue, user]);

  const discountedAmount = coupon
    ? coupon.discountType === "flat"
      ? Math.max(0, price.launchAmount - coupon.discountValue)
      : Math.max(0, Math.round(price.launchAmount * (1 - coupon.discountValue / 100)))
    : price.launchAmount;

  async function handleApplyCoupon() {
    setCouponError(null);
    try {
      const result = await apiGet<CouponPreview>(`/checkout/coupon/${couponInput.trim()}`);
      setCoupon(result);
    } catch {
      setCoupon(null);
      setCouponError("That coupon code isn't valid or has expired.");
    }
  }

  async function onSubmit(customer: CustomerInput) {
    setOrderState({ phase: "processing" });

    try {
      const data = await apiPost<{ orderId: string; amount: number; currency: string; keyId: string }>(
        "/checkout/create-order",
        { productSlug: product.slug, couponCode: coupon?.code, customer }
      );

      await loadRazorpayScript();
      if (!window.Razorpay) {
        setOrderState({ phase: "failed", message: "Could not load the secure payment window. Please try again." });
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "CogniSprint",
        description: product.name,
        order_id: data.orderId,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            const verifyData = await apiPost<{ verified: boolean }>("/checkout/verify", response);
            if (verifyData.verified) {
              navigate(`/checkout/success?order=${response.razorpay_order_id}`);
            } else {
              setOrderState({ phase: "failed", message: "We couldn't verify that payment. If money was deducted, contact support with your order ID." });
            }
          } catch {
            setOrderState({ phase: "failed", message: "We couldn't verify that payment. If money was deducted, contact support with your order ID." });
          }
        },
        modal: { ondismiss: () => setOrderState({ phase: "form" }) },
      });

      razorpay.open();
      setOrderState({ phase: "form" });
    } catch (error) {
      if (error instanceof ApiError && error.status === 501) {
        setOrderState({ phase: "unavailable", message: error.message });
        return;
      }
      setOrderState({ phase: "failed", message: "Something went wrong starting your payment. Please try again." });
    }
  }

  if (orderState.phase === "processing") return <PaymentStatus status="processing" />;
  if (orderState.phase === "unavailable") return <PaymentStatus status="unavailable" message={orderState.message} />;
  if (orderState.phase === "failed") {
    return <PaymentStatus status="failed" message={orderState.message} onRetry={() => setOrderState({ phase: "form" })} />;
  }

  if (loading) return <PaymentStatus status="processing" />;

  if (!user) {
    return (
      <div className="surface-card mx-auto max-w-xl p-6 text-center sm:p-8">
        <h2 className="text-xl font-semibold">Sign in before checkout</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Your purchase is linked to your CogniSprint account so course access can be granted automatically.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/login" state={{ from: "/checkout" }} className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-blue)] px-5 text-sm font-semibold text-white">
            Sign in
          </Link>
          <Link to="/register" className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-5 text-sm font-semibold">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Your details</h2>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" readOnly {...register("email")} />
            <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">Access will be granted to this account.</p>
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
            <FieldError>{errors.phone?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="coupon">Coupon code (optional)</Label>
            <div className="flex gap-2">
              <Input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="LAUNCH100" />
              <Button type="button" variant="secondary" onClick={handleApplyCoupon} className="shrink-0">
                <Tag className="h-4 w-4" /> Apply
              </Button>
            </div>
            {couponError ? <FieldError>{couponError}</FieldError> : null}
            {coupon && !couponError ? <p className="mt-1.5 text-xs font-medium text-[var(--color-success)]">Coupon {coupon.code} applied.</p> : null}
          </div>

          <label className="flex items-start gap-2.5 text-xs text-[var(--color-ink-muted)]">
            <input type="checkbox" className="mt-0.5" {...register("acceptedTerms")} />
            <span>
              I accept the <Link to="/legal/terms" className="underline">Terms &amp; Conditions</Link>,{" "}
              <Link to="/legal/refund-policy" className="underline">Refund Policy</Link> and{" "}
              <Link to="/legal/disclaimer" className="underline">Educational Disclaimer</Link>.
            </span>
          </label>
          <FieldError>{errors.acceptedTerms?.message}</FieldError>

          <Button type="submit" size="lg" className="w-full">
            Pay {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(discountedAmount / 100)} securely
          </Button>
          <p className="text-center text-xs text-[var(--color-ink-faint)]">
            Payment is processed by Razorpay. We never see or store your card details.
          </p>
        </div>
      </form>

      <div className="space-y-6">
        <CheckoutSummary product={product} discountedAmount={discountedAmount} />
        <Alert variant="info" title="Educational program, not a guaranteed outcome">
          CogniSprint is an educational skills-practice program and does not guarantee IQ, academic or professional outcomes.
        </Alert>
      </div>
    </div>
  );
}
