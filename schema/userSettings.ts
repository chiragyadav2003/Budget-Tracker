import { Currencies } from "@/lib/currencies";
import * as z from "zod";

export const UpdateUserCurrencySchame = z.object({
    currency: z.custom((value) => {
        const found = Currencies.some((c) => c.value === value)
        if (!found) {
            throw new Error(`invalid currency: ${value}`)
        }
        return value;
    })
})