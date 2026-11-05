import type {
  CreateReportRequest,
  Laporan,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateProfileRequest,
  User,
  Zona,
  ZonesQuery,
} from '../types';

// One method per endpoint the screens need; more are added as screens are built.
export interface ApiClient {
  /** API-002 POST /api/auth/login */
  login(body: LoginRequest): Promise<LoginResponse>;
  /** API-001 POST /api/auth/register (role is always pengemudi) */
  register(body: RegisterRequest): Promise<LoginResponse>;
  /** API-003 GET /api/zones, zones within `radius` meters of the point (needs token) */
  getZones(query: ZonesQuery): Promise<Zona[]>;
  /** API-004 GET /api/zones/{zona_id}, one zone for the detail bottom sheet (needs token). 404 when the zone does not exist. */
  getZone(zonaId: number): Promise<Zona>;
  /** API-006 GET /api/reports/me, the driver's own reports (needs token) */
  getMyReports(): Promise<Laporan[]>;
  /** GET /api/users/me (usulan, belum ada di docs/03): the signed-in user, to show name and email in Profil. 401 when the token is no longer valid. */
  getMe(): Promise<User>;
  /** PATCH /api/users/me (usulan, belum ada di docs/03): edit profile; 422 with `fieldErrors` when validation fails. */
  updateMe(body: UpdateProfileRequest): Promise<User>;
  /** API-005 POST /api/reports (pengemudi). 422 with `fieldErrors` when validation fails. */
  createReport(body: CreateReportRequest): Promise<Laporan>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}
