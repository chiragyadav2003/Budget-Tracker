import { PiggyBank } from "lucide-react"

function Logo() {
    return (
        <a href="/" className="flex items-center gap-2 hover:shadow-md  hover:shadow-amber-300">
            <PiggyBank className=" stroke-amber-500 size-11 stroke-[1.5]" />
            <p className=" bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent">
                Budget Tracker
            </p>
        </a>
    )
}

export default Logo