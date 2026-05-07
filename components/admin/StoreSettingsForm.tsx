"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreSettingsItem, StoreSettingsPayload } from "@/types/settings";

type Props = {
  initial?: Partial<StoreSettingsItem>;
};

export default function StoreSettingsForm({ initial = {} }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: initial.storeName || "",
    storeDescription: initial.storeDescription || "",
    logo: initial.logo || "",
    favicon: initial.favicon || "",
    primaryColor: initial.primaryColor || "#ec4899",
    secondaryColor: initial.secondaryColor || "#fbbf24",
    contactEmail: initial.contactEmail || "",
    supportEmail: initial.supportEmail || "",
    phone: initial.phone || "",
    currency: initial.currency || "USD",
    timezone: initial.timezone || "UTC",
    taxRate: String(initial.taxRate || 0),
    freeShippingThreshold: String(initial.freeShippingThreshold || ""),
    maxUploadSize: String(initial.maxUploadSize || 50),
    // Address
    addressStreet: initial.address?.street || "",
    addressCity: initial.address?.city || "",
    addressState: initial.address?.state || "",
    addressZip: initial.address?.zipCode || "",
    addressCountry: initial.address?.country || "",
    // Social
    socialFacebook: initial.socialLinks?.facebook || "",
    socialInstagram: initial.socialLinks?.instagram || "",
    socialTwitter: initial.socialLinks?.twitter || "",
    socialLinkedin: initial.socialLinks?.linkedin || "",
    socialTiktok: initial.socialLinks?.tiktok || "",
    // Policies
    shippingPolicy: initial.shippingPolicy || "",
    returnPolicy: initial.returnPolicy || "",
    privacyPolicy: initial.privacyPolicy || "",
    termsOfService: initial.termsOfService || "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload: StoreSettingsPayload = {
      storeName: formData.storeName || undefined,
      storeDescription: formData.storeDescription || undefined,
      logo: formData.logo || undefined,
      favicon: formData.favicon || undefined,
      primaryColor: formData.primaryColor || undefined,
      secondaryColor: formData.secondaryColor || undefined,
      contactEmail: formData.contactEmail || undefined,
      supportEmail: formData.supportEmail || undefined,
      phone: formData.phone || undefined,
      currency: formData.currency || "USD",
      timezone: formData.timezone || "UTC",
      taxRate: Number(formData.taxRate) || 0,
      freeShippingThreshold: formData.freeShippingThreshold ? Number(formData.freeShippingThreshold) : undefined,
      maxUploadSize: Number(formData.maxUploadSize) || 50,
      address: {
        street: formData.addressStreet || undefined,
        city: formData.addressCity || undefined,
        state: formData.addressState || undefined,
        zipCode: formData.addressZip || undefined,
        country: formData.addressCountry || undefined,
      },
      socialLinks: {
        facebook: formData.socialFacebook || undefined,
        instagram: formData.socialInstagram || undefined,
        twitter: formData.socialTwitter || undefined,
        linkedin: formData.socialLinkedin || undefined,
        tiktok: formData.socialTiktok || undefined,
      },
      shippingPolicy: formData.shippingPolicy || undefined,
      returnPolicy: formData.returnPolicy || undefined,
      privacyPolicy: formData.privacyPolicy || undefined,
      termsOfService: formData.termsOfService || undefined,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Save failed");
        return;
      }
      setMessage("Settings saved successfully");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Store Info</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            required
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            placeholder="Store name"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="Contact email"
            type="email"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone number"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="supportEmail"
            value={formData.supportEmail}
            onChange={handleChange}
            placeholder="Support email"
            type="email"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <textarea
            name="storeDescription"
            value={formData.storeDescription}
            onChange={handleChange}
            placeholder="Store description"
            rows={3}
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Branding</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            placeholder="Logo URL"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="favicon"
            value={formData.favicon}
            onChange={handleChange}
            placeholder="Favicon URL"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <div className="flex gap-2">
            <input
              name="primaryColor"
              value={formData.primaryColor}
              onChange={handleChange}
              type="color"
              className="h-12 w-12 rounded-xl border border-zinc-200 cursor-pointer"
            />
            <input
              name="primaryColor"
              value={formData.primaryColor}
              onChange={handleChange}
              placeholder="Primary color"
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none font-mono"
            />
          </div>
          <div className="flex gap-2">
            <input
              name="secondaryColor"
              value={formData.secondaryColor}
              onChange={handleChange}
              type="color"
              className="h-12 w-12 rounded-xl border border-zinc-200 cursor-pointer"
            />
            <input
              name="secondaryColor"
              value={formData.secondaryColor}
              onChange={handleChange}
              placeholder="Secondary color"
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none font-mono"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Address</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            name="addressStreet"
            value={formData.addressStreet}
            onChange={handleChange}
            placeholder="Street address"
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="addressCity"
            value={formData.addressCity}
            onChange={handleChange}
            placeholder="City"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="addressState"
            value={formData.addressState}
            onChange={handleChange}
            placeholder="State/Province"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="addressZip"
            value={formData.addressZip}
            onChange={handleChange}
            placeholder="ZIP/Postal code"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="addressCountry"
            value={formData.addressCountry}
            onChange={handleChange}
            placeholder="Country"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Social Links</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            { name: "socialFacebook", label: "Facebook" },
            { name: "socialInstagram", label: "Instagram" },
            { name: "socialTwitter", label: "Twitter/X" },
            { name: "socialLinkedin", label: "LinkedIn" },
            { name: "socialTiktok", label: "TikTok" },
          ].map((field) => (
            <input
              key={field.name}
              name={field.name}
              value={formData[field.name as keyof typeof formData]}
              onChange={handleChange}
              placeholder={field.label}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Business Settings</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="INR">INR</option>
            <option value="BDT">BDT</option>
          </select>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">EST</option>
            <option value="America/Chicago">CST</option>
            <option value="America/Los_Angeles">PST</option>
            <option value="Europe/London">GMT</option>
            <option value="Asia/Kolkata">IST</option>
          </select>
          <input
            name="taxRate"
            value={formData.taxRate}
            onChange={handleChange}
            placeholder="Tax rate (%)"
            type="number"
            step="0.01"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="freeShippingThreshold"
            value={formData.freeShippingThreshold}
            onChange={handleChange}
            placeholder="Free shipping threshold"
            type="number"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            name="maxUploadSize"
            value={formData.maxUploadSize}
            onChange={handleChange}
            placeholder="Max upload size (MB)"
            type="number"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Policies</p>
        <div className="mt-6 space-y-4">
          {[
            { name: "shippingPolicy", label: "Shipping Policy" },
            { name: "returnPolicy", label: "Return Policy" },
            { name: "privacyPolicy", label: "Privacy Policy" },
            { name: "termsOfService", label: "Terms of Service" },
          ].map((field) => (
            <textarea
              key={field.name}
              name={field.name}
              value={formData[field.name as keyof typeof formData]}
              onChange={handleChange}
              placeholder={field.label}
              rows={4}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
            />
          ))}
        </div>
      </section>

      {message && <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">{message}</div>}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
