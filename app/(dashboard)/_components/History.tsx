"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { Period, Timeframe } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { useMemo, useState } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { useQuery } from "@tanstack/react-query";
import { GetHistoryDataReturnType } from "@/app/api/history-data/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";



function History({ userSettings }: { userSettings: UserSettings }) {

    const [timeframe, setTimeframe] = useState<Timeframe>("month");
    const [period, setPeriod] = useState<Period>({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    const historyDataQuery = useQuery<GetHistoryDataReturnType>({
        queryKey: ["overview", "history", timeframe, period],
        queryFn: () => fetch(`/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`)
            .then(res => res.json())
    })

    const dataAvailable = historyDataQuery.data && historyDataQuery.data.length > 0;

    return (
        <div className="container">
            <h2 className="mt-12 text-3xl font-bold">
                History
            </h2>
            <Card className=" col-span-12 mt-2 w-full">
                <CardHeader className="gap-2">
                    <CardTitle className="grid grid-flow-row justify-between md:grid-flow-col gap-2">
                        <HistoryPeriodSelector
                            period={period}
                            setPeriod={setPeriod}
                            timeframe={timeframe}
                            setTimeframe={setTimeframe}
                        />

                        <div className="flex h-10 gap-2">
                            <Badge className="flex items-center gap-2 text-sm" variant={"outline"}>
                                <div className="h-4 w-4 rounded-full bg-emerald-500">
                                </div>
                                Income
                            </Badge>
                            <Badge className="flex items-center gap-2 text-sm" variant={"outline"}>
                                <div className="h-4 w-4 rounded-full bg-red-500">
                                </div>
                                Expense
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
                        {dataAvailable && (
                            <div>CHART</div>
                        )}
                        {
                            !dataAvailable && (
                                <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                                    No data for the selected period.
                                    <p className="text-sm text-muted-foreground">
                                        Try selecting a different period or adding new transactions.
                                    </p>
                                </Card>
                            )
                        }
                    </SkeletonWrapper>
                </CardContent>
            </Card>
        </div>
    )
}

export default History;