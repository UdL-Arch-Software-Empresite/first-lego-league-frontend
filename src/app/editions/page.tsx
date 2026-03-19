import { EditionsService } from "@/api/editionApi";
import PageShell from "@/app/components/page-shell";
import { serverAuthProvider } from "@/lib/authProvider";
import { Edition } from "@/types/edition";
import Link from "next/link";
import type { ReactNode } from "react";

function getEditionHref(edition: Edition) {
    const sanitizedUri = edition.uri?.split(/[?#]/, 1)[0] ?? "";
    const segments = sanitizedUri.split("/").filter(Boolean);
    return segments.at(-1) ? `/editions/${segments.at(-1)}` : null;
}

function EditionHeading({ edition, children }: Readonly<{ edition: Edition; children: ReactNode }>) {
    const href = getEditionHref(edition);

    if (!href) {
        return <div className="list-title">{children}</div>;
    }

    return (
        <Link className="list-title block hover:text-primary" href={href}>
            {children}
        </Link>
    );
}

export default async function EditionsPage() {
    let editions: Edition[] = [];
    let error: string | null = null;

    try {
        const service = new EditionsService(serverAuthProvider);
        editions = await service.getEditions();
    } catch (e) {
        console.error("Failed to fetch editions:", e);
        error = "Failed to load editions.";
    }

    return (
        <PageShell
            eyebrow="Competition archive"
            title="Editions"
            description="Browse the yearly editions of FIRST LEGO League, including venue and season details."
        >
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="page-eyebrow">Edition list</div>
                    <h2 className="section-title">Season overview</h2>
                    <p className="section-copy max-w-3xl">
                        Each card highlights the season, venue and published information for that edition.
                    </p>
                </div>

                {error && (
                    <p className="border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                        {error}
                    </p>
                )}

                {!error && editions.length === 0 && (
                    <p className="border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                        No editions found.
                    </p>
                )}

                <ul className="list-grid">
                    {editions.map((edition, index) => (
                        <li key={edition.uri ?? index} className="list-card pl-7">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0 space-y-2">
                                    <div className="list-kicker">Edition</div>
                                    <EditionHeading edition={edition}>
                                        {edition.year}
                                    </EditionHeading>
                                    {edition.venueName && (
                                        <div className="list-support">{edition.venueName}</div>
                                    )}
                                    {edition.description && (
                                        <div className="list-support">{edition.description}</div>
                                    )}
                                </div>
                                {edition.state && (
                                    <div className="status-badge">{edition.state}</div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </PageShell>
    );
}
