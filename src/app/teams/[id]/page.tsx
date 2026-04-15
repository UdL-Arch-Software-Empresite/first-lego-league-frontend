import { TeamsService } from "@/api/teamApi";
import ErrorAlert from "@/app/components/error-alert";
import EmptyState from "@/app/components/empty-state";
import { serverAuthProvider } from "@/lib/authProvider";
import { Team } from "@/types/team";
import { User } from "@/types/user";
import { parseErrorMessage, NotFoundError } from "@/types/errors";
import { TeamMembersManager } from "@/app/components/team-member-manager";

interface TeamDetailPageProps {
    readonly params: Promise<{ id: string }>;
}

function extractTeamMembers(data: any): any[] {
    const rawMembers = Array.isArray(data) ? data : (data?._embedded?.teamMembers ?? []);
    
    return rawMembers.map((m: any) => {
        // Extraemos solo strings planos. CERO objetos complejos.
        return {
            id: String(m.id ?? m.uri?.split('/').pop() ?? Math.random()),
            name: String(m.name ?? m.username ?? "Unnamed member"),
            role: String(m.role ?? "Member"),
            // Guardamos la URL de borrado como un string simple
            uri: String(m._links?.self?.href || m.uri || "")
        };
    });
}

export default async function TeamDetailPage(props: Readonly<TeamDetailPageProps>) {
    const { id } = await props.params;
    const service = new TeamsService(serverAuthProvider);

    let team: Team | null = null;
    let coaches: User[] = [];
    let members: any[] = [];
    let error: string | null = null;
    let membersError: string | null = null;

    try {
        team = await service.getTeamById(id);
    } catch (e) {
        error = e instanceof NotFoundError ? "Team not found" : parseErrorMessage(e);
    }

    if (team && !error) {
        try {
            const [coachesData, membersData] = await Promise.all([
                service.getTeamCoach(id),
                service.getTeamMembers(id),
            ]);
            coaches = coachesData ?? [];
            members = extractTeamMembers(membersData);
        } catch (e) {
            console.error("Error loading members:", e);
            membersError = parseErrorMessage(e);
        }
    }

    if (error) return <ErrorAlert message={error} />;
    if (!team) return <EmptyState title="Not found" description="Team does not exist" />;

    const coachName = coaches.length > 0 
        ? (coaches[0].name ?? coaches[0].username ?? coaches[0].email ?? "Unnamed coach") 
        : "No coach assigned";

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
            <div className="w-full max-w-3xl px-4 py-10">
                <div className="w-full rounded-lg border bg-white p-6 shadow-sm dark:bg-black">
                    <h1 className="mb-2 text-2xl font-semibold">{team.name}</h1>

                    <div className="mb-6 space-y-1 text-sm text-zinc-600">
                        {team.city && <p><strong>City:</strong> {team.city}</p>}
                        <p><strong>Coach:</strong> {coachName}</p>
                    </div>

                    <h2 className="mt-8 mb-4 text-xl font-semibold">Team Members</h2>

                    {!membersError && (
                        <TeamMembersManager
                            // La key asegura que si cambian los miembros, el componente se refresca
                            key={`${id}-${members.length}`}
                            teamId={id}
                            initialMembers={members}
                            isCoach={true} 
                            isAdmin={true}
                        />
                    )}
                    {membersError && <p className="text-red-500 text-sm">{membersError}</p>}
                </div>
            </div>
        </div>
    );
}