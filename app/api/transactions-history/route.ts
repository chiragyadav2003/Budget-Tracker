import prisma from "@/lib/db";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    //validate params
    const queryParams = OverviewQuerySchema.safeParse({ from, to });
    if (!queryParams.success) {
        return Response.json(queryParams.error.message, {
            status: 400
        });
    }

    const transactions = await getTransactionHistory(
        user.id,
        queryParams.data.from,
        queryParams.data.to
    )

    return Response.json(transactions);
}


//used in frontend
export type GetTransactionHistoryResponseType = Awaited<ReturnType<typeof getTransactionHistory>>

async function getTransactionHistory(userId: string, from: Date, to: Date) {
    //find user settings
    const userSettings = await prisma.userSettings.findUnique({
        where: {
            userId
        }
    })
    if (!userSettings) {
        throw new Error("user settings not found");
    }

    //get formatter for userSettings currency
    const formatter = GetFormatterForCurrency(userSettings.currency);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: {
                gte: from,
                lte: to
            },
        },
        orderBy: {
            date: "desc"
        }
    })

    //we will return the transaction in the formatted amount
    return transactions.map((transaction) => ({
        ...transaction,
        //send formattedAmount
        formattedAmount: formatter.format(transaction.amount)
    }))
}