"use server";

import prisma from "@/lib/db";
import { DeleteCategorySchema, DeleteCategorySchemaType } from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function DeleteCategory(form: DeleteCategorySchemaType) {

    const parsedBody = DeleteCategorySchema.safeParse(form);
    if (!parsedBody.success) {
        throw new Error("bad request");
    }

    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const { name, type } = parsedBody.data;

    let res;
    try {
        res = await prisma.category.delete({
            where: {
                name_type_userId: {
                    userId: user.id,
                    type: parsedBody.data.type,
                    name: parsedBody.data.name
                }
            },
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error("db updation error");
    }

    return res;
}