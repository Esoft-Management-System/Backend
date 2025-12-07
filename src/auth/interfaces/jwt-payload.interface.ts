export interface JwtPayload {
  sub: string;
  staffId: string;
  fullName: string;
  email: string;
  role: 'staff' | 'admin';
  isPasswordTemporary?: boolean;
}