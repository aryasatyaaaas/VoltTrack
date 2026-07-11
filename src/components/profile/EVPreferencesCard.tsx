"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Zap, Loader2, Star, Plus, X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import type { UserPreferencesData } from "@/types";

interface EVPreferencesCardProps {
    preferences: UserPreferencesData;
    onSave: (data: Partial<UserPreferencesData>) => Promise<void>;
}

const CURRENCIES: { code: string; name: string }[] = [
    { code: "AED", name: "AED — UAE Dirham" },
    { code: "AFN", name: "AFN — Afghan Afghani" },
    { code: "ALL", name: "ALL — Albanian Lek" },
    { code: "AMD", name: "AMD — Armenian Dram" },
    { code: "ANG", name: "ANG — Netherlands Antillean Guilder" },
    { code: "AOA", name: "AOA — Angolan Kwanza" },
    { code: "ARS", name: "ARS — Argentine Peso" },
    { code: "AUD", name: "AUD — Australian Dollar" },
    { code: "AWG", name: "AWG — Aruban Florin" },
    { code: "AZN", name: "AZN — Azerbaijani Manat" },
    { code: "BAM", name: "BAM — Bosnia-Herzegovina Convertible Mark" },
    { code: "BBD", name: "BBD — Barbadian Dollar" },
    { code: "BDT", name: "BDT — Bangladeshi Taka" },
    { code: "BGN", name: "BGN — Bulgarian Lev" },
    { code: "BHD", name: "BHD — Bahraini Dinar" },
    { code: "BIF", name: "BIF — Burundian Franc" },
    { code: "BMD", name: "BMD — Bermudian Dollar" },
    { code: "BND", name: "BND — Brunei Dollar" },
    { code: "BOB", name: "BOB — Bolivian Boliviano" },
    { code: "BRL", name: "BRL — Brazilian Real" },
    { code: "BSD", name: "BSD — Bahamian Dollar" },
    { code: "BTN", name: "BTN — Bhutanese Ngultrum" },
    { code: "BWP", name: "BWP — Botswanan Pula" },
    { code: "BYN", name: "BYN — Belarusian Ruble" },
    { code: "BZD", name: "BZD — Belizean Dollar" },
    { code: "CAD", name: "CAD — Canadian Dollar" },
    { code: "CDF", name: "CDF — Congolese Franc" },
    { code: "CHF", name: "CHF — Swiss Franc" },
    { code: "CKD", name: "CKD — Cook Islands Dollar" },
    { code: "CLP", name: "CLP — Chilean Peso" },
    { code: "CNY", name: "CNY — Chinese Yuan (Renminbi)" },
    { code: "COP", name: "COP — Colombian Peso" },
    { code: "CRC", name: "CRC — Costa Rican Colón" },
    { code: "CUC", name: "CUC — Cuban Convertible Peso" },
    { code: "CUP", name: "CUP — Cuban Peso" },
    { code: "CVE", name: "CVE — Cape Verdean Escudo" },
    { code: "CZK", name: "CZK — Czech Koruna" },
    { code: "DJF", name: "DJF — Djiboutian Franc" },
    { code: "DKK", name: "DKK — Danish Krone" },
    { code: "DOP", name: "DOP — Dominican Peso" },
    { code: "DZD", name: "DZD — Algerian Dinar" },
    { code: "EGP", name: "EGP — Egyptian Pound" },
    { code: "ERN", name: "ERN — Eritrean Nakfa" },
    { code: "ETB", name: "ETB — Ethiopian Birr" },
    { code: "EUR", name: "EUR — Euro" },
    { code: "FJD", name: "FJD — Fijian Dollar" },
    { code: "FKP", name: "FKP — Falkland Islands Pound" },
    { code: "GBP", name: "GBP — British Pound Sterling" },
    { code: "GEL", name: "GEL — Georgian Lari" },
    { code: "GHS", name: "GHS — Ghanaian Cedi" },
    { code: "GIP", name: "GIP — Gibraltar Pound" },
    { code: "GMD", name: "GMD — Gambian Dalasi" },
    { code: "GNF", name: "GNF — Guinean Franc" },
    { code: "GTQ", name: "GTQ — Guatemalan Quetzal" },
    { code: "GYD", name: "GYD — Guyanese Dollar" },
    { code: "HKD", name: "HKD — Hong Kong Dollar" },
    { code: "HNL", name: "HNL — Honduran Lempira" },
    { code: "HTG", name: "HTG — Haitian Gourde" },
    { code: "HUF", name: "HUF — Hungarian Forint" },
    { code: "IDR", name: "IDR — Indonesian Rupiah" },
    { code: "ILS", name: "ILS — Israeli New Shekel" },
    { code: "INR", name: "INR — Indian Rupee" },
    { code: "IQD", name: "IQD — Iraqi Dinar" },
    { code: "IRR", name: "IRR — Iranian Rial" },
    { code: "ISK", name: "ISK — Icelandic Króna" },
    { code: "JMD", name: "JMD — Jamaican Dollar" },
    { code: "JOD", name: "JOD — Jordanian Dinar" },
    { code: "JPY", name: "JPY — Japanese Yen" },
    { code: "KES", name: "KES — Kenyan Shilling" },
    { code: "KGS", name: "KGS — Kyrgystani Som" },
    { code: "KHR", name: "KHR — Cambodian Riel" },
    { code: "KMF", name: "KMF — Comorian Franc" },
    { code: "KPW", name: "KPW — North Korean Won" },
    { code: "KRW", name: "KRW — South Korean Won" },
    { code: "KWD", name: "KWD — Kuwaiti Dinar" },
    { code: "KYD", name: "KYD — Cayman Islands Dollar" },
    { code: "KZT", name: "KZT — Kazakhstani Tenge" },
    { code: "LAK", name: "LAK — Laotian Kip" },
    { code: "LBP", name: "LBP — Lebanese Pound" },
    { code: "LKR", name: "LKR — Sri Lankan Rupee" },
    { code: "LRD", name: "LRD — Liberian Dollar" },
    { code: "LSL", name: "LSL — Lesotho Loti" },
    { code: "LYD", name: "LYD — Libyan Dinar" },
    { code: "MAD", name: "MAD — Moroccan Dirham" },
    { code: "MDL", name: "MDL — Moldovan Leu" },
    { code: "MGA", name: "MGA — Malagasy Ariary" },
    { code: "MKD", name: "MKD — Macedonian Denar" },
    { code: "MMK", name: "MMK — Myanmar Kyat" },
    { code: "MNT", name: "MNT — Mongolian Tögrög" },
    { code: "MOP", name: "MOP — Macanese Pataca" },
    { code: "MRU", name: "MRU — Mauritanian Ouguiya" },
    { code: "MUR", name: "MUR — Mauritian Rupee" },
    { code: "MVR", name: "MVR — Maldivian Rufiyaa" },
    { code: "MWK", name: "MWK — Malawian Kwacha" },
    { code: "MXN", name: "MXN — Mexican Peso" },
    { code: "MYR", name: "MYR — Malaysian Ringgit" },
    { code: "MZN", name: "MZN — Mozambican Metical" },
    { code: "NAD", name: "NAD — Namibian Dollar" },
    { code: "NGN", name: "NGN — Nigerian Naira" },
    { code: "NIO", name: "NIO — Nicaraguan Córdoba" },
    { code: "NOK", name: "NOK — Norwegian Krone" },
    { code: "NPR", name: "NPR — Nepalese Rupee" },
    { code: "NZD", name: "NZD — New Zealand Dollar" },
    { code: "OMR", name: "OMR — Omani Rial" },
    { code: "PAB", name: "PAB — Panamanian Balboa" },
    { code: "PEN", name: "PEN — Peruvian Sol" },
    { code: "PGK", name: "PGK — Papua New Guinean Kina" },
    { code: "PHP", name: "PHP — Philippine Peso" },
    { code: "PKR", name: "PKR — Pakistani Rupee" },
    { code: "PLN", name: "PLN — Polish Złoty" },
    { code: "PYG", name: "PYG — Paraguayan Guaraní" },
    { code: "QAR", name: "QAR — Qatari Riyal" },
    { code: "RON", name: "RON — Romanian Leu" },
    { code: "RSD", name: "RSD — Serbian Dinar" },
    { code: "RUB", name: "RUB — Russian Ruble" },
    { code: "RWF", name: "RWF — Rwandan Franc" },
    { code: "SAR", name: "SAR — Saudi Riyal" },
    { code: "SBD", name: "SBD — Solomon Islands Dollar" },
    { code: "SCR", name: "SCR — Seychellois Rupee" },
    { code: "SDG", name: "SDG — Sudanese Pound" },
    { code: "SEK", name: "SEK — Swedish Krona" },
    { code: "SGD", name: "SGD — Singapore Dollar" },
    { code: "SHP", name: "SHP — Saint Helena Pound" },
    { code: "SLE", name: "SLE — Sierra Leonean Leone" },
    { code: "SOS", name: "SOS — Somali Shilling" },
    { code: "SRD", name: "SRD — Surinamese Dollar" },
    { code: "SSP", name: "SSP — South Sudanese Pound" },
    { code: "STN", name: "STN — São Tomé & Príncipe Dobra" },
    { code: "SYP", name: "SYP — Syrian Pound" },
    { code: "SZL", name: "SZL — Swazi Lilangeni" },
    { code: "THB", name: "THB — Thai Baht" },
    { code: "TJS", name: "TJS — Tajikistani Somoni" },
    { code: "TMT", name: "TMT — Turkmenistani Manat" },
    { code: "TND", name: "TND — Tunisian Dinar" },
    { code: "TOP", name: "TOP — Tongan Paʻanga" },
    { code: "TRY", name: "TRY — Turkish Lira" },
    { code: "TTD", name: "TTD — Trinidad & Tobago Dollar" },
    { code: "TWD", name: "TWD — New Taiwan Dollar" },
    { code: "TZS", name: "TZS — Tanzanian Shilling" },
    { code: "UAH", name: "UAH — Ukrainian Hryvnia" },
    { code: "UGX", name: "UGX — Ugandan Shilling" },
    { code: "USD", name: "USD — US Dollar" },
    { code: "UYU", name: "UYU — Uruguayan Peso" },
    { code: "UZS", name: "UZS — Uzbekistani Som" },
    { code: "VES", name: "VES — Venezuelan Bolívar" },
    { code: "VND", name: "VND — Vietnamese Dong" },
    { code: "VUV", name: "VUV — Vanuatu Vatu" },
    { code: "WST", name: "WST — Samoan Tala" },
    { code: "XAF", name: "XAF — Central African CFA Franc" },
    { code: "XCD", name: "XCD — East Caribbean Dollar" },
    { code: "XOF", name: "XOF — West African CFA Franc" },
    { code: "XPF", name: "XPF — CFP Franc" },
    { code: "YER", name: "YER — Yemeni Rial" },
    { code: "ZAR", name: "ZAR — South African Rand" },
    { code: "ZMW", name: "ZMW — Zambian Kwacha" },
    { code: "ZWG", name: "ZWG — Zimbabwe Gold" },
];

export function EVPreferencesCard({ preferences, onSave }: EVPreferencesCardProps) {
    const [currency, setCurrency] = useState(preferences.currency);
    const [favoriteLocations, setFavoriteLocations] = useState<string[]>(preferences.favoriteLocations || []);

    // For adding a new custom location
    const [newLocationInput, setNewLocationInput] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Combobox / API states
    const [userLat, setUserLat] = useState<number | null>(null);
    const [userLon, setUserLon] = useState<number | null>(null);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    // Location fetch removed — external station API no longer used.

    const locationSuggestions = useMemo(() => {
        const query = newLocationInput.toLowerCase();
        // No external station data — just allow custom input (no dropdown suggestions)
        return [] as { title: string; distance: number | undefined }[];
    }, [newLocationInput]);

    // Use only favoriteLocations for the defaultLocation dropdown
    const availableDefaults = Array.from(new Set([...favoriteLocations]));

    const hasChanges =
        currency !== preferences.currency ||
        JSON.stringify(favoriteLocations) !== JSON.stringify(preferences.favoriteLocations || []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ currency, favoriteLocations });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddFavorite = () => {
        const val = newLocationInput.trim();
        if (val && !favoriteLocations.includes(val)) {
            setFavoriteLocations(prev => [...prev, val]);
        }
        setNewLocationInput("");
    };

    const handleAddFavoriteSuggestion = (title: string) => {
        if (!favoriteLocations.includes(title)) {
            setFavoriteLocations(prev => [...prev, title]);
        }
        setNewLocationInput("");
        setShowLocationDropdown(false);
    };

    const handleRemoveFavorite = (locToRemove: string) => {
        setFavoriteLocations(prev => prev.filter(l => l !== locToRemove));
    };

    const inputClasses = "w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition-all";

    return (
        <Card className="space-y-5 p-6 border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-3">
                <div className="rounded-full p-2" style={{ background: "rgba(255,107,53,0.1)", color: "var(--volt-orange)" }}>
                    <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>
                    EV Preferences
                </h3>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    {/* Currency */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
                            Currency
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className={inputClasses}
                            style={{ background: "var(--white)" }}
                            onFocus={e => e.currentTarget.style.border = "1px solid var(--volt-orange)"}
                            onBlur={e => e.currentTarget.style.border = "1px solid var(--border)"}
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Favorite Locations Section */}
                <div className="space-y-3 rounded-2xl border border-[var(--border)] p-4" style={{ background: "var(--surface-2)" }}>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
                        <Star className="h-3 w-3" /> Custom Favorite Locations
                    </label>
                    <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                        Add your frequent charging spots (like &quot;Grand Indonesia&quot; or &quot;My Secret Garage&quot;) to easily pick them in your log.
                    </p>

                    <div className="flex items-center justify-between gap-2 relative z-20">
                        <input
                            type="text"
                            placeholder="Add new location or search SPKLU..."
                            value={newLocationInput}
                            onChange={(e) => setNewLocationInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddFavorite()}
                            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition-all"
                            style={{ background: "var(--white)" }}
                            onFocus={e => {
                                setShowLocationDropdown(true);
                                e.currentTarget.style.border = "1px solid var(--volt-orange)";
                            }}
                            onBlur={e => {
                                setTimeout(() => setShowLocationDropdown(false), 200);
                                e.currentTarget.style.border = "1px solid var(--border)";
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddFavorite}
                            disabled={!newLocationInput.trim()}
                            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:opacity-50 hover:bg-opacity-80"
                            style={{ background: "rgba(255,107,53,0.1)", color: "var(--volt-orange)" }}
                        >
                            <Plus className="h-4 w-4" /> Add
                        </button>
                        
                        <AnimatePresence>
                            {showLocationDropdown && locationSuggestions.length > 0 && (
                                <m.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute left-0 right-24 top-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg no-scrollbar"
                                >
                                    {locationSuggestions.map((loc, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors"
                                            style={{ color: "var(--ink)" }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = "rgba(255,107,53,0.08)";
                                                e.currentTarget.style.color = "var(--volt-orange)";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.color = "var(--ink)";
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleAddFavoriteSuggestion(loc.title);
                                            }}
                                        >
                                            <span className="truncate pr-4 font-medium" style={{ color: "var(--ink)" }}>
                                                {loc.title}
                                            </span>
                                            {loc.distance !== undefined && (
                                                <span className="flex-shrink-0 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                                    {loc.distance.toFixed(1)} km
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </m.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Chips */}
                    {favoriteLocations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {favoriteLocations.map((loc) => (
                                <span key={loc} className="flex items-center gap-1.5 rounded-full border border-[var(--volt-orange)]/30 px-3 py-1.5 text-xs font-bold" style={{ background: "rgba(255,107,53,0.05)", color: "var(--volt-orange)" }}>
                                    {loc}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFavorite(loc)}
                                        className="rounded-full p-0.5 transition-colors hover:bg-black/10"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Save button */}
            <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)", boxShadow: "0 4px 16px rgba(255,107,53,0.2)" }}
            >
                {isSaving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : saved ? (
                    "Saved ✓"
                ) : (
                    "Save Preferences"
                )}
            </button>
        </Card>
    );
}
