import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, updateUser, inviteUser } from '@/services/userService';
import { ADMIN_EMAIL, isAdminUser, saveAdminPassword } from '@/lib/admin';
import { AppRole, toAppRole, toStoredRole } from '@/lib/roles';
import { readUserEmails, rememberUserEmail } from '@/lib/userEmails';

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company_name: '',
    role: 'user' as AppRole
  });

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.user_id ? readUserEmails()[user.user_id] || '' : '',
        password: '',
        confirmPassword: '',
        full_name: user.full_name || '',
        company_name: user.company_name || '',
        role: toAppRole(user.role)
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && user) {
        // Update existing user
        await updateUser(user.id, {
          full_name: formData.full_name,
          company_name: formData.company_name,
          role: toStoredRole(formData.role)
        });
        toast({
          title: "User Updated",
          description: "User has been updated successfully.",
        });
      } else {
        // Create new user (invite)
        if (!formData.email) {
          throw new Error('Email is required for new users');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (isAdminUser(formData.email)) {
          await saveAdminPassword(formData.password);
          toast({
            title: "Administrator saved",
            description: `Sign in as ${ADMIN_EMAIL} with this password.`,
          });
        } else {
          const result = await inviteUser(
            formData.email,
            formData.role,
            formData.full_name,
            formData.company_name,
            formData.password
          );
          if (result.user.user_id) {
            rememberUserEmail(result.user.user_id, formData.email);
          }
          toast({
            title: result.alreadyExisted ? 'User updated' : 'User added',
            description: `${formData.email.trim()} can sign in with this password.`,
          });
        }
      }

      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save user. Please try again.';
      const expected = message.includes('already registered')
        || message.includes('at least 6')
        || message.includes('do not match')
        || message.includes('Email is required');
      if (!expected) {
        console.error('Error saving user:', error);
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit User' : 'Add User'}
        </CardTitle>
        {!isEditing && (
          <CardDescription>
            Add a person with the email address and password they will use to sign in.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(!isEditing || formData.email) && (
          <div className="space-y-2">
            <Label htmlFor="email">Email Address{isEditing ? '' : ' *'}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@example.com"
              required={!isEditing}
              readOnly={isEditing}
              disabled={isEditing}
            />
            {!isEditing && (
              <p className="text-sm text-gray-500">
                This is the email address they will use to sign in.
              </p>
            )}
          </div>
          )}

          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-sm text-gray-500 md:col-span-2">
                Use at least 6 characters. They sign in with this password.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>User:</strong> Can sign in and make bookings</p>
              <p><strong>Manager:</strong> Can manage restaurants and bookings</p>
              <p><strong>Admin:</strong> Can manage users, restaurants, and bookings</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update User' : 'Add User')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm; 