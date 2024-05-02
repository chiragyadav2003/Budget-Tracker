export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-[70%] w-full md:h-[60%]  items-center justify-center">
            {children}
        </div>
    )
}