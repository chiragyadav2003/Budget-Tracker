import Logo from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col w-full h-full items-center justify-center">
            <div className="fixed top-14">
                <Logo />
            </div>
            <div className=" mt-10 fixed top-20">
                {children}
            </div>
        </div>
    )
}