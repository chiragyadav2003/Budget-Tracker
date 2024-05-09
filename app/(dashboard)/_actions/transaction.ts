"use server";

import prisma from "@/lib/db";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


export async function CreateTransaction(form: CreateTransactionSchemaType) {
    const parsedBody = CreateTransactionSchema.safeParse(form);
    if (!parsedBody.success) {
        throw new Error(parsedBody.error.message);
    }

    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const { amount, date, category, type, description } = parsedBody.data;

    //validate category (if exist in db or not)
    const categoryRow = await prisma.category.findFirst({
        where: {
            userId: user.id,
            name: category
        }
    })

    if (!categoryRow) {
        throw new Error("category not found");
    }

    // start db transaction($transaction)
    await prisma.$transaction([
        // create user txn
        prisma.transaction.create({
            data: {
                userId: user.id,
                amount,
                date,
                description: description || "",
                type,
                category: categoryRow.name,
                categoryIcon: categoryRow.icon
            }
        }),

        // upsert-update/insert aggragated table for monthHistory
        prisma.monthHistory.upsert({
            where: {
                day_month_year_userId: {
                    userId: user.id,
                    day: date.getUTCDay(),
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear()
                },
            },
            create: {
                userId: user.id,
                day: date.getUTCDay(),
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === "expense" ? amount : 0,
                income: type === "income" ? amount : 0,
            },
            update: {
                expense: {
                    increment: type === "expense" ? amount : 0
                },
                income: {
                    increment: type === "income" ? amount : 0
                }
            }
        }),

        //update year aggregate table
        prisma.yearHistory.upsert({
            where: {
                month_year_userId: {
                    userId: user.id,
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear()
                },
            },
            create: {
                userId: user.id,
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === "expense" ? amount : 0,
                income: type === "income" ? amount : 0,
            },
            update: {
                expense: {
                    increment: type === "expense" ? amount : 0
                },
                income: {
                    increment: type === "income" ? amount : 0
                }
            }
        }),
    ])


}
