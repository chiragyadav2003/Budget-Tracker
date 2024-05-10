import prisma from "@/lib/db";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

//api end point to get category(income,expense) data separately b/w a time period
export async function GET(request: Request) {

    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const queryParams = OverviewQuerySchema.safeParse({ from, to });
    if (!queryParams.success) {
        throw new Error(queryParams.error.message);
    }

    const stats = await getCategoriesStats(
        user.id, queryParams.data.from, queryParams.data.to
    )

    return Response.json(stats);
}

//this type will be used in frontend while making  query using tenStack as a generic
export type GetCategoriesStatsType = Awaited<ReturnType<typeof getCategoriesStats>>

async function getCategoriesStats(userId: string, from: Date, to: Date) {
    const stats = await prisma.transaction.groupBy({
        by: ["type", "category", "categoryIcon"],
        where: {
            userId,
            date: {
                gte: from,
                lte: to
            },
        },
        _sum: {
            amount: true
        },
        orderBy: {
            _sum: {
                amount: "desc"
            },
        },
    });

    return stats;
}