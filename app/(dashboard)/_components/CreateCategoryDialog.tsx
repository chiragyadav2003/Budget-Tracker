"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TransactionType } from "@/lib/types";
import { CreateCategorySchema, CreateCategorySchemaType } from "@/schema/categories";
import { Button } from "@/components/ui/button";
import { CircleOff, Loader2, PlusSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { DialogClose } from "@radix-ui/react-dialog";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateCategory } from "../_actions/createCategory";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";




function CreateCategoryDialog(
    {
        type,
        successCallback,
        trigger
    }: {
        type: TransactionType;
        successCallback: (category: Category) => void;
        trigger?: React.ReactNode
    }) {

    const [open, setOpen] = useState(false);

    const form = useForm<CreateCategorySchemaType>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            type
        }
    })

    const queryClient = useQueryClient();

    const theme = useTheme();

    //NOTE - Unlike queries, mutations are typically used to create/update/delete data or perform server side-effects.
    const { mutate, isPending } = useMutation({
        mutationFn: CreateCategory,
        onSuccess: async (data: Category) => {
            form.reset({
                name: "",
                icon: "",
                type
            });

            toast.success(`Category ${data.name} created successfully 🎉`, {
                id: "create-category"
            });

            successCallback(data);

            // update queries after creation of new category without reload/refresh
            await queryClient.invalidateQueries({
                queryKey: ["categories"]
            });

            setOpen(prev => !prev);
        },
        onError: () => {
            toast.error("Something went wrong", {
                id: "create-category"
            });
        }
    })

    const onSubmit = useCallback(
        (values: CreateCategorySchemaType) => {
            toast.loading("Creating category...", {
                id: "create-category"
            });
            mutate(values);
        },
        [mutate]
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : <Button
                    variant={"ghost"}
                    className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground">
                    <PlusSquareIcon className="mr-2 h-4 w-4" />Create new category...
                </Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create new
                        <span className={cn("m-1",
                            type === "income" ? "text-emerald-500" :
                                "text-red-600"
                        )}>
                            {type}
                        </span>
                        category
                    </DialogTitle>
                    <DialogDescription>
                        Categories are used to group your transacttions
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Category"
                                            {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is how your category will appear in the app.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"}
                                                    className="h-[100px] w-full"
                                                >
                                                    {form.watch("icon") ? (
                                                        <div
                                                            className="flex flex-col items-center gap-2"
                                                        >
                                                            <span className="text-5xl" role="img">
                                                                {field.value}
                                                            </span>
                                                            <p className="text-xs text-muted-foreground">
                                                                Click to change
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="flex flex-col items-center gap-2"
                                                        >
                                                            <CircleOff className=" h-[48px] w-[48px] " />
                                                            <p className="text-xs text-muted-foreground">
                                                                Click to select
                                                            </p>
                                                        </div>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full">
                                                <Picker
                                                    data={data}
                                                    // handle theme change
                                                    theme={theme.resolvedTheme}
                                                    // NOTE : handling emoji change
                                                    onEmojiSelect={(emoji: { native: string }) => {
                                                        field.onChange(emoji.native)
                                                    }} />
                                            </PopoverContent>

                                        </Popover>
                                    </FormControl>
                                    <FormDescription>
                                        This is how your category appear in the app
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant={"secondary"}
                            onClick={() => {
                                form.reset();
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isPending}>
                        {!isPending && "Create"}
                        {isPending && <Loader2 className=" animate-spin" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}

export default CreateCategoryDialog