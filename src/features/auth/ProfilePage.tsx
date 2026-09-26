import React from 'react';
import { Card, Input, Button, Badge } from '../../components/ui';
import { useAuth } from './AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">User Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your account information and preferences</p>
      </div>
      <Card title="Account Information">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Role:</span>
            <Badge variant="info">{profile?.role || 'Manager'}</Badge>
          </div>
          <Input label="Full Name" defaultValue={profile?.name || ''} />
          <Input label="Email Address" defaultValue={user?.email || ''} disabled />
          <Button variant="primary" size="sm">Save Changes</Button>
        </div>
      </Card>
    </div>
  );
};
