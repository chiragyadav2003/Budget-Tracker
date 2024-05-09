import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays } from "date-fns";
import { z } from "zod";

export const OverviewQuerySchema = z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
}).refine((args) => {
    const { from, to } = args;

    //calculate days difference
    const days = differenceInDays(to, from);

    //checks for validation
    const isValidRange = days > 0 && days < MAX_DATE_RANGE_DAYS;

    return isValidRange;
})