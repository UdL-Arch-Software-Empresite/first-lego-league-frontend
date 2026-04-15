'use client';

import { useState } from 'react';
import { Button } from '@/app/components/button';
import { AVAILABLE_MEMBER_ROLES } from '@/types/team';

type AddMemberFormProps = Readonly<{
    onSubmit: (name: string, role: string) => Promise<boolean> | void;
    onCancel: () => void;
    isLoading?: boolean;
}>;

export function AddMemberForm({
    onSubmit,
    onCancel,
    isLoading = false
}: AddMemberFormProps) {

    const [name, setName] = useState('');
    const [role, setRole] = useState(AVAILABLE_MEMBER_ROLES[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        const success = await onSubmit(name.trim(), role);

        // limpiar solo si ha ido bien
        if (success) {
            setName('');
            setRole(AVAILABLE_MEMBER_ROLES[0]);
        }
    };

    const isDisabled = isLoading || !name.trim() || !role;

    return (
        <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded">
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Name"
                className="border p-2 w-full"
            />

            <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="border p-2 w-full"
            >
                {AVAILABLE_MEMBER_ROLES.map(r => (
                    <option key={r} value={r}>
                        {r}
                    </option>
                ))}
            </select>

            <div className="flex gap-2">
                <Button type="submit" disabled={isDisabled}>
                    {isLoading ? 'Adding...' : 'Add'}
                </Button>

                <Button type="button" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}