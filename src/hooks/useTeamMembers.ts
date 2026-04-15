'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { TeamsService } from '@/api/teamApi';
import { clientAuthProvider } from '@/lib/authProvider';
import { User } from '@/types/user';
import { MAX_TEAM_MEMBERS } from '@/types/team';

export function useTeamMembers(teamId: string, initialMembers: User[] = []) {
    const [members, setMembers] = useState<User[]>(initialMembers);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMembers(initialMembers);
    }, [initialMembers]);

    const service = useMemo(
        () => new TeamsService(clientAuthProvider),
        []
    );

    const addMember = useCallback(
        async (name: string, role: string) => {
            if (!teamId) {
                setError('Missing teamId');
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                if (members.length >= MAX_TEAM_MEMBERS) {
                    setError('Team has reached maximum members');
                    return false;
                }

                const newMember = await service.addTeamMember(teamId, {
                    name,
                    role,
                });

                setMembers(prev => [...prev, newMember]);
                return true;
            } catch (e) {
                setError('Failed to add member');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [teamId, members.length, service]
    );

    const removeMember = useCallback(
        async (memberUri: string) => {
            if (!memberUri) {
                setError('Missing member URI');
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                await service.removeTeamMember(memberUri);
                setMembers(prev =>
                    prev.filter(m => {
                        const memberData = m as unknown;
                        const href = memberData._links?.self?.href || memberData.uri;
                        return href !== memberUri;
                    })
                );
            } catch {
                setError('Failed to remove member');
            } finally {
                setIsLoading(false);
            }
        },
        [service]
    );

    return {
        members: members ?? [],
        isLoading,
        error,
        addMember,
        removeMember,
        isFull: (members ?? []).length >= MAX_TEAM_MEMBERS,
    };
}