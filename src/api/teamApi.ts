import type { AuthStrategy } from "@/lib/authProvider";
import { Team } from "@/types/team";
import { User } from "@/types/user";
import {
    fetchHalCollection,
    fetchHalResource,
    createHalResource,
    deleteHal
} from "./halClient";

function getSafeEncodedId(id: string): string {
    try {
        return encodeURIComponent(decodeURIComponent(id));
    } catch {
        return encodeURIComponent(id);
    }
}

export interface AddMemberPayload {
    name: string;
    role: string;
}

export class TeamsService {
    constructor(private readonly authStrategy: AuthStrategy) {}

    async getTeams(): Promise<Team[]> {
        return fetchHalCollection<Team>(
            "/teams",
            this.authStrategy,
            "teams"
        );
    }

    async getTeamById(id: string): Promise<Team> {
        const teamId = getSafeEncodedId(id);

        return fetchHalResource<Team>(
            `/teams/${teamId}`,
            this.authStrategy
        );
    }

    async getTeamCoach(id: string): Promise<User[]> {
        const teamId = getSafeEncodedId(id);

        return fetchHalCollection<User>(
            `/teams/${teamId}/trainedBy`,
            this.authStrategy,
            "coaches"
        );
    }

    async getTeamMembers(teamId: string): Promise<any[]> {
        const safeId = getSafeEncodedId(teamId);

        // 1. Pedimos la lista general (el JSON que me pasaste)
        const members = await fetchHalCollection<any>(
            `/teamMembers?page=0&size=50`,
            this.authStrategy,
            "teamMembers"
        );

        // 2. Filtramos en el cliente
        return members.filter(m => {
            const teamHref = m._links?.team?.href;
            if (!teamHref) return false;

            /**
             * IMPORTANTE: 
             * Según tu JSON, el link es "teamMembers/{memberId}/team".
             * Para que este filtro funcione, necesitamos saber si ese link
             * pertenece a tu equipo. 
             * * Si la API no te da el ID del equipo en el miembro, 
             * este filtrado manual solo funcionará si comparas contra una URL 
             * que ya conozcas o si la API expande el equipo.
             */
            
            // Si el link del equipo contiene el ID del equipo, esto funcionará:
            return teamHref.includes(`/teams/${safeId}`);
        });
    }
    async addTeamMember(teamId: string, data: AddMemberPayload): Promise<any> {
        const safeId = getSafeEncodedId(teamId);

        return createHalResource<any>(
            "/teamMembers",
            {
                name: data.name.trim(),
                role: data.role,
                birthDate: "2010-01-01",
                gender: "MALE",
                tShirtSize: "M",
                team: `/teams/${safeId}`
            },
            this.authStrategy,
            "team member"
        );
    }

    async removeTeamMember(memberUri: string): Promise<void> {
        await deleteHal(memberUri, this.authStrategy);
    }
}