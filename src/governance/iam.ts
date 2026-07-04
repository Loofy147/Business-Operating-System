export interface User {
  id: string;
  roles: string[];
}

export class IAM {
  public static checkPermission(user: User, resource: string, action: string): boolean {
    // Mock RBAC logic
    if (user.roles.includes('admin')) return true;

    // User can read anything, but execute only generic tasks
    if (user.roles.includes('user')) {
        if (action === 'read') return true;
        if (action === 'execute' && resource === 'generic-execution') return true;
    }

    return false;
  }
}
