import {jwtDecode} from 'jwt-decode';

export interface TokenPayload {
  id?: string;         // maps to NameIdentifier / nameid
  username?: string;   // maps to Name / unique_name
  email?: string;
  isActive?: boolean;
  roles?: string[];
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded: any = jwtDecode(token);

    return {
      id: decoded['nameid'],                  // this is the claim for NameIdentifier
      username: decoded['unique_name'],       // this is the claim for Name
      email: decoded['email'],
      isActive: decoded['IsActive'] === 'True' || decoded['IsActive'] === true,
      roles: Array.isArray(decoded['role'])
        ? decoded['role']
        : decoded['role']
        ? [decoded['role']]
        : [],
      exp: decoded.exp,
      iat: decoded.iat,
    };
  } catch (e) {
    console.error('Invalid token', e);
    return null;
  }
}
