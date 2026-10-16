import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_EMAIL, saveAdminPassword } from '@/lib/admin';

const AdminPasswordCard = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Use at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: 'Passwords do not match',
        description: 'Type the same password in both fields.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await saveAdminPassword(password);
      setPassword('');
      setConfirm('');
      toast({
        title: 'Password saved',
        description: `Use this password the next time you sign in as ${ADMIN_EMAIL}.`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrator password</CardTitle>
        <CardDescription>
          This is the password for {ADMIN_EMAIL}. Saving it here does not call Supabase, so it will not return a 400.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="admin-password">New password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password-confirm">Confirm password</Label>
            <Input
              id="admin-password-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={saving}>
            {saving ? 'Saving...' : 'Save password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminPasswordCard;
