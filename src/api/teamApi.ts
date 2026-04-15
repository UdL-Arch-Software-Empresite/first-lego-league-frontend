import type { AuthStrategy } from "@/lib/authProvider";
import { Team, AVAILABLE_MEMBER_ROLES } from "@/types/team";
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
        return fetchHalCollection<Team>("/teams", this.authStrategy, "teams");
    }

    async getTeamById(id: string): Promise<Team> {
        const teamId = getSafeEncodedId(id);
        return fetchHalResource<Team>(`/teams/${teamId}`, this.authStrategy);
    }

    async getTeamCoach(id: string): Promise<User[]> {
        const teamId = getSafeEncodedId(id);
        return fetchHalCollection<User>(`/teams/${teamId}/trainedBy`, this.authStrategy, "coaches");
    }

    // EL CAMBIO CLAVE: Ruta directa a members
    async getTeamMembers(teamId: string): Promise<any[]> {
        const safeId = getSafeEncodedId(teamId);
        return fetchHalCollection<any>(
            `/teams/${safeId}/members`,
            this.authStrategy,
            "teamMembers"
        );
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