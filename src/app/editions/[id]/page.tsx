import { EditionsService } from "@/api/editionApi";
import PageShell from "@/app/components/page-shell";
import { serverAuthProvider } from "@/lib/authProvider";
import { Edition } from "@/types/edition";
import { Team } from "@/types/team";
import Link from "next/link";

interface EditionDetailPageProps {
    params: Promise<{ id: string }>;
}

function getTeamHref(team: Team) {
    const sanitizedUri = team.uri?.split(/[?#]/, 1)[0] ?? "";
    const segments = sanitizedUri.split("/").filter(Boolean);
    const teamId = segments.at(-1);

    return teamId ? `/teams/${teamId}` : "/teams";
}

function getEditionTitle(edition: Edition | null, id: string) {
    if (edition?.year) {
        return `Edition ${edition.year}`;
    }

    return `Edition ${id}`;
}

export default async function EditionDetailPage(props: Readonly<EditionDetailPageProps>) {
    const { id } = await props.params;
    const service = new EditionsService(serverAuthProvider);

    const [editionResult, teamsResult] = await Promise.allSettled([
        service.getEditionById(id),
        service.getEditionTeams(id),
    ]);

    const edition = editionResult.status === "fulfilled" ? editionResult.value : null;
    const teams = teamsResult.status === "fulfilled" ? teamsResult.value : [];
    const error = editionResult.status === "rejected" || teamsResult.status === "rejected"
        ? "Failed to load this edition."
        : null;

    return (
        <PageShell
            eyebrow="Competition archive"
            title={getEditionTitle(edition, id)}
            description="Edition details and participating teams for this season."
        >
            <div className="space-y-8">
                <div className="space-y-3">
                    <div className="page-eyebrow">Edition details</div>
                    <h2 className="section-title">{getEditionTitle(edition, id)}</h2>
                    {edition?.venueName ? (
                        <p className="section-copy">
                            Hosted at {edition.venueName}.
                        </p>
                    ) : null}
                    {edition?.description ? (
                        <p className="section-copy max-w-3xl">{edition.description}</p>
                    ) : null}
                </div>

                {error ? (
                    <p className="border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                        {error}
                    </p>
                ) : null}

                <div className="editorial-divider" />

                <div className="space-y-4">
                    <div className="page-eyebrow">Team roster</div>
                    <h2 className="section-title">Participating Teams</h2>

                    {!error && teams.length === 0 ? (
                        <p className="border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                            No teams registered for this edition.
                        </p>
                    ) : null}

                    {!error && teams.length > 0 ? (
                        <ul className="list-grid">
                            {teams.map((team, index) => (
                                <li key={team.uri ?? index} className="list-card pl-7">
                                    <div className="list-kicker">Team</div>
                                    <Link
                                        href={getTeamHref(team)}
                                        className="list-title block hover:text-primary"
                                    >
                                        {team.name ?? `Team ${index + 1}`}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </div>
        </PageShell>
    );
}
