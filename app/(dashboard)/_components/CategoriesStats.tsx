"use client";

import { GetCategoriesStatsType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";



interface Props {
    from: Date;
    to: Date;
    userSettings: UserSettings;
}

function CategoriesStats({ from, to, userSettings }: Props) {

    // "overciew" as passed as queryKey so that it's data also invalidated while updation of db in real time as used in CreateTransactionDialog onSuccess callback
    const statsQuery = useQuery<GetCategoriesStatsType>({
        queryKey: ["overview", "categories", "stats", from, to],
        queryFn: () => fetch(`/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`)
            .then(res => res.json())
    })

    //useMemo hook is used so thst we do not change overview format on every request, change format only when currency changes
    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    return (
        <div className="flex flex-wrap w-full gap-2 md:flex-nowrap">
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <CategoriesCard
                    formatter={formatter}
                    type="income"
                    data={statsQuery.data || []}
                />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <CategoriesCard
                    formatter={formatter}
                    type="expense"
                    data={statsQuery.data || []}
                />
            </SkeletonWrapper>
        </div>
    )
}

export default CategoriesStats;



function CategoriesCard({ formatter, type, data }: {
    formatter: Intl.NumberFormat
    type: TransactionType
    data: GetCategoriesStatsType
}) {
    const filteredData = data.filter(el => el.type === type);

    /*
    The accumulator parameter is the single value that will be returned by the reduce() method. https://www.freecodecamp.org/news/how-to-use-javascript-array-reduce-method/
    */
    const total = filteredData.reduce(
        (acc, el) => acc += el._sum?.amount || 0, 0);

    return (
        <Card className="h-80 w-full col-span-6">
            <CardHeader>
                <CardTitle
                    className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
                    {type === "income" ? "Incomes" : "Expenses"} by category
                </CardTitle>

                <div className="flex items-center justify-between gap-2">
                    {filteredData.length === 0 && (
                        <div className="flex flex-col justify-center items-center h-60 w-full">
                            No data for the selected priod.
                            <p className="text-sm text-muted-foreground">
                                Try selecting a different period or try adding a new {type}
                            </p>
                        </div>
                    )}

                    {filteredData.length > 0 && (
                        <ScrollArea className="h-60 w-full px-4">
                            <div className="flex flex-col w-full gap-4 p-4">
                                {filteredData.map(item => {
                                    const amount = item._sum.amount || 0;
                                    const percentage = (amount * 100) / (total || amount);
                                    return (
                                        <div
                                            className="flex flex-col gap-2"
                                            key={item.category}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center text-gray-400">
                                                    {item.categoryIcon} {item.category}
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        ({percentage.toFixed(0)}%)
                                                    </span>
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    {formatter.format(amount)}
                                                </span>
                                            </div>
                                            <Progress
                                                value={percentage}
                                                indicator={type === "income" ? "bg-emerald-500" : "bg-red-500"}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )
                    }
                </div>
            </CardHeader>
        </Card>
    )
}