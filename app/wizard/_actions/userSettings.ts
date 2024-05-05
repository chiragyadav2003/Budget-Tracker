"use server";

import prisma from "@/lib/db";
import { UpdateUserCurrencySchame } from "@/schame/userSettings";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function UpdateUserCurrency(currency: string) {
    const parsedBody = UpdateUserCurrencySchame.safeParse({ currency });

    if (!parsedBody.success) {
        throw parsedBody.error;
    }

    // throw new Error("test error");

    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const userSettings = await prisma.userSettings.update({
        where: {
            userId: user.id
        },
        data: {
            currency
        }
    })

    return userSettings;
}