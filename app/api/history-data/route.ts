import prisma from "@/lib/db";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";

const getHistoryDataSchema = z.object({
    timeframe: z.enum(["month", "year"]),
    month: z.coerce.number().min(0).max(11).default(0),
    year: z.coerce.number().min(2000).max(2050),
})

export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    //we will read period and timeframe from api
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    //validate params
    const queryParams = getHistoryDataSchema.safeParse({ timeframe, month, year });
    if (!queryParams.success) {
        return Response.json(queryParams.error.message, { status: 400 });
    }

    const data = await getHistoryData(user.id, queryParams.data.timeframe, {
        month: queryParams.data.month,
        year: queryParams.data.year
    })

    return Response.json(data);
}

// used in frontend while making query using tenStack as generic
export type GetHistoryDataReturnType = Awaited<ReturnType<typeof getHistoryData>>;

async function getHistoryData(userId: string, timeframe: Timeframe, period: Period) {
    switch (timeframe) {
        case "year":
            return await getYearHistoryData(userId, period.year);

        case "month":
            return await getMonthHistoryData(userId, period.year, period.month);
    }
}

type HistoryData = {
    expense: number,
    income: number,
    year: number,
    month: number,
    day?: number
}

async function getYearHistoryData(userId: string, year: number) {
    const result = await prisma.yearHistory.groupBy({
        by: ["month"],
        where: {
            userId,
            year,
        },
        _sum: {
            expense: true,
            income: true
        },
        orderBy: [
            {
                month: "asc",
            },
        ],
    });

    if (!result || result.length === 0) return [];

    /*NOTE- we need to modify our return type from result, let's say in year 2023, there is only 1 txn in month of jan, then return type will be like this - 
            [
                {
                    month:0,
                    income:499,
                    expense:69,
                    year:2023
                }
            ]
        but we need data in this format - 
            [
                {
                    month:0,
                    income:499,
                    expense:69,
                    year:2023
                },
                {
                    month:1,
                    income:0,
                    expense:0,
                    year:2023
                },
                .......for rest of month
            ]
        and this type of data will also be easy to handle
    */

    const history: HistoryData[] = [];

    for (let i = 0; i < 12; i++) {
        let expense = 0;
        let income = 0;

        const month = result.find(row => row.month === i);
        if (month) {
            expense += month._sum.expense || 0;
            income += month._sum.income || 0;
        }
        history.push({
            year,
            month: i,
            income,
            expense
        })
    }
    return history;
}

async function getMonthHistoryData(userId: string, year: number, month: number) {
    const result = await prisma.monthHistory.groupBy({
        by: ["day"],
        where: {
            userId,
            year,
            month
        },
        _sum: {
            expense: true,
            income: true
        },
        orderBy: [
            {
                day: "asc"
            }
        ]
    });

    if (!result || result.length === 0) return [];

    const history: HistoryData[] = [];
    const daysInMonth = getDaysInMonth(new Date(year, month))

    for (let i = 1; i <= daysInMonth; i++) {
        let expense = 0;
        let income = 0;

        const day = result.find(row => row.day === i);

        if (day) {
            expense += day?._sum.expense || 0;
            income += day?._sum.income || 0;
        }

        history.push({
            expense,
            income,
            year,
            month,
            day: i,
        })
    }

    return history;
}