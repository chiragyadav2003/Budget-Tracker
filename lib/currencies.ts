// define currencies
export const Currencies = [
    { value: "USD", label: "$ Dollar", locale: "en-US" },
    { value: "EUR", label: "€ Euro", locale: "en-DE" }, //Dutch English
    { value: "JPY", label: "¥ Yen", locale: "en-JP" },
    { value: "GBP", label: "£ Pound", locale: "en-GB" },
    { value: "INR", label: "₹ Rupee", locale: "en-IN" },
]

// define currency type
export type Currency = (typeof Currencies)[0]