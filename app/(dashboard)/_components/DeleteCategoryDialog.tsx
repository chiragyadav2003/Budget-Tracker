"use client";

import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { DeleteCategory } from "../_actions/deleteCategory";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TransactionType } from "@/lib/types";



interface Props {
    trigger: ReactNode;
    category: Category
}

function DeleteCategoryDialog({ trigger, category }: Props) {
    const categoryIdentifier = `${category.name}-${category.type}`;

    //on a successful deletion, we need to invalidate categories in application
    const queryClient = useQueryClient();

    // useMutation for CRUD operations
    const deleteMutation = useMutation({
        mutationFn: DeleteCategory,
        onSuccess: async () => {
            toast.success("category deleted successfully 🎉", {
                id: categoryIdentifier
            })

            await queryClient.invalidateQueries({
                queryKey: ["categories"]
            })
        },
        onError: () => {
            toast.error("Something went wrong", {
                id: categoryIdentifier
            })
        }
    });

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        category.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        toast.loading("Deleting category...", {
                            id: categoryIdentifier
                        }),
                            deleteMutation.mutate({
                                name: category.name,
                                type: category.type as TransactionType
                                //NOTE-need to cast type as txn
                            })
                    }}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteCategoryDialog;