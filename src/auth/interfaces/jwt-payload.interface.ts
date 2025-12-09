export interface JwtPayload {
  sub: string;
  staffId: string;
  fullName: string;
  email: string;
  role: 'staff' | 'admin';
  isPasswordTemporary?: boolean;
}

export interface StudentJWTPayload {
  sub: string; // MongoDB ObjectID as string
  eNumber: string;
  fullName: string;
  email: string;
  role: 'student';
}