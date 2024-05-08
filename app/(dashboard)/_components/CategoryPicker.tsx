import { TransactionType } from "@/lib/types"
import { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";



function CategoryPicker(
    {
        type,
        onChange
    }: {
        type: TransactionType,
        onChange: (value: string) => void
    }) {


    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");

    useEffect(() => {
        if (!value) return;
        onChange(value) //when value changes,call onChange callback
    }, [onChange, value])


    const categoriesQuery = useQuery({
        queryKey: ["categories", type],
        queryFn: () => fetch(`/api/categories?type=${type}`)
            .then(res => res.json())
    })

    const selectedCategory = categoriesQuery.data?.find(
        (category: Category) => category.name === value
    )

    const successCallback = useCallback(
        (category: Category) => {
            setValue(category.name);
            setOpen(prev => !prev);
        },
        [setOpen, setValue]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant={"outline"} role="combobox"
                    aria-expanded={open} className="w-[200px] justify-between">
                    {
                        selectedCategory ? (
                            <CategoryRow category={selectedCategory} />
                        ) : (
                            "Select category"
                        )
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command onSubmit={(e) => { e.preventDefault() }}>
                    <CommandInput placeholder="Search category..." />
                    <CreateCategoryDialog
                        type={type}
                        successCallback={successCallback} />
                    <CommandList>
                        <CommandEmpty>
                            <p>Category not found</p>
                            <p className="text-xs text-muted-foreground">
                                Tip: Create a new category
                            </p>
                        </CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            {
                                categoriesQuery.data && categoriesQuery.data.map((category: Category) => (
                                    <CommandItem
                                        key={category.name}
                                        onSelect={() => {
                                            setValue(category.name);
                                            setOpen(prev => !prev);
                                        }}>
                                        <CategoryRow category={category} />
                                        <Check className={cn(
                                            "ml-2 w-4 h-4",
                                            value === category.name ? "opacity-100" : "opacity-0"
                                        )} />
                                    </CommandItem>
                                ))
                            }
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover >
    )
}

function CategoryRow({ category }: { category: Category }) {
    return (
        <div className="flex items-center gap-2">
            <span role="img">{category.icon}</span>
            <span>{category.name}</span>
        </div>
    )
}

export default CategoryPicker