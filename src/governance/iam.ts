export interface User {
  id: string;
  roles: string[];
}

export class IAM {
  public static checkPermission(user: User, resource: string, action: string): boolean {
    // Mock RBAC logic
    if (user.roles.includes('admin')) return true;
    if (user.roles.includes('user') && action === 'read') return true;
    return false;
  }
}
