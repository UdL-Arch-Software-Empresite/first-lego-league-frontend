'use client';

import { useState } from 'react';
import { Button } from '@/app/components/button';
import { AddMemberForm } from './add-member-form';
import { DeleteMemberDialog } from './delete-member-dialog';
import { useTeamMembers } from '@/hooks/useTeamMembers';

export function TeamMembersManager({
    teamId,
    initialMembers = [],
    isCoach,
    isAdmin
}: any) {
    const isAuthorized = isCoach || isAdmin;

    const {
        members,
        addMember,
        removeMember,
        isFull
    } = useTeamMembers(teamId, initialMembers);

    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState<any>(null);

    const safeMembers = (members ?? []).filter(
        (m: any) => m && typeof m === 'object'
    );

    return (
        <div className="space-y-4">
            {isAuthorized && !isFull && (
                <Button
                    onClick={() => setShowForm(true)}
                    disabled={isFull}
                >
                    Add Member
                </Button>
            )}

            {isFull && (
                <p className="text-yellow-600">
                    Max members reached
                </p>
            )}

            {showForm && (
                <AddMemberForm
                    onSubmit={async (name, role) => {
                        const success = await addMember(name, role);
                        if (success) setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <ul className="space-y-2">
                {safeMembers.map((m: any, index: number) => (
                    <li
                        key={
                            m?._links?.self?.href ||
                            m?.uri ||
                            m?.id ||
                            `${m?.name ?? 'member'}-${index}`
                        }
                        className="flex items-center justify-between border p-3 rounded-lg bg-white shadow-sm dark:bg-zinc-900"
                    >
                        <span className="font-medium">
                            {m.name ?? "Unnamed member"}
                        </span>

                        {isAuthorized && (
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => setSelected(m)}
                            >
                                Delete
                            </Button>
                        )}
                    </li>
                ))}
            </ul>

            <DeleteMemberDialog
                isOpen={!!selected}
                onCancel={() => setSelected(null)}
                onConfirm={async () => {
                    const deleteUrl = selected?._links?.self?.href || selected?.uri;
                    if (!deleteUrl) return;

                    await removeMember(deleteUrl);
                    setSelected(null);
                }}
            />
        </div>
    );
}