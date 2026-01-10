
export const metadata = {
    title: "NCH Admin Dashboard",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "NCH Admin",
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
