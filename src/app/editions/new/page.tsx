import { UsersService } from "@/api/userApi";
import PageShell from "@/app/components/page-shell";
import { serverAuthProvider } from "@/lib/authProvider";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import NewEditionForm from "./form";

export const dynamic = "force-dynamic";

function isAdmin(user: User | null) {
    return !!user?.authorities?.some(
        (authority) => authority.authority === "ROLE_ADMIN"
    );
}

export default async function NewEditionPage() {
    const auth = await serverAuthProvider.getAuth();
    if (!auth) redirect("/login");

    const currentUser = await new UsersService(serverAuthProvider).getCurrentUser().catch(() => null);

    if (!isAdmin(currentUser)) {
        redirect("/");
    }

    return (
        <PageShell
            eyebrow="Competition archive"
            title="New Edition"
            description="Create a new FIRST LEGO League edition and publish its basic season details."
        >
            <NewEditionForm />
        </PageShell>
    );
}
