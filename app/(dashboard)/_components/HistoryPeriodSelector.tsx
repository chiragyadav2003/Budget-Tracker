"use client";

import { getHistoryPeriodResponseType } from "@/app/api/history-periods/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Period, Timeframe } from "@/lib/types"
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


interface Props {
    period: Period;
    setPeriod: (period: Period) => void;
    timeframe: Timeframe;
    setTimeframe: (timeframe: Timeframe) => void;
}

function HistoryPeriodSelector({ period, setPeriod, timeframe, setTimeframe }: Props) {

    const historyPeriods = useQuery<getHistoryPeriodResponseType>({
        queryKey: ["overview", "history", "periods"],
        queryFn: () => fetch("/api/history-periods")
            .then(res => res.json())
    });

    return (
        <div className="flex flex-wrap items-center gap-4">
            <SkeletonWrapper
                isLoading={historyPeriods.isFetching}
                fullWidth={false}
            >
                <Tabs
                    value={timeframe}
                    onValueChange={(value) => setTimeframe(value as Timeframe)}
                >
                    <TabsList>
                        <TabsTrigger value="year">Year</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                </Tabs>
            </SkeletonWrapper>
            <div className="flex flex-wrap items-center gap-2">
                <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
                    <YearSelector
                        period={period}
                        setPeriod={setPeriod}
                        years={historyPeriods.data || []}
                    />
                </SkeletonWrapper>

                {/* if timeframe is "month" then we will show monthSelector */}

                {timeframe === "month" && (
                    <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
                        <MonthSelector
                            period={period}
                            setPeriod={setPeriod}
                        />
                    </SkeletonWrapper>
                )}

            </div>
        </div>
    )
}

export default HistoryPeriodSelector;

function YearSelector({ period, setPeriod, years }: {
    period: Period;
    setPeriod: (period: Period) => void;
    years: getHistoryPeriodResponseType;
}) {
    return (
        <Select
            value={period.year.toString()}
            //month will be same, year will be updated in YearSelector
            onValueChange={(value) => {
                setPeriod({
                    month: period.month,
                    year: parseInt(value)
                })
            }}>
            <SelectTrigger className="w-[180px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {
                    years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                            {year}
                        </SelectItem>
                    ))
                }
            </SelectContent>
        </Select>
    )
}

function MonthSelector({ period, setPeriod }: {
    period: Period;
    setPeriod: (period: Period) => void;
}) {
    return (
        <Select
            value={period.month.toString()}
            //yaer will be same, month will be updated in MonthSelector
            onValueChange={(value) => {
                setPeriod({
                    month: parseInt(value),
                    year: period.year
                })
            }}>
            <SelectTrigger className="w-[180px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) => {
                        //NOTE : getting month string from month index
                        const monthString = new Date(period.year, month, 1).toLocaleString("default", { month: "long" })
                        return (
                            <SelectItem key={month} value={month.toString()}>
                                {monthString}
                            </SelectItem>
                        )
                    })
                }
            </SelectContent>
        </Select>
    )
}