import type {
  AdminReportsQuery,
  CreateAccidentRequest,
  DishubReportsQuery,
  ExportFile,
  ExportQuery,
  KecelakaanResmi,
  Laporan,
  LoginRequest,
  LoginResponse,
  Statistics,
  User,
  VerifyRequest,
  VerifyResponse,
  Zona,
  ZonesQuery,
} from '../types';

// One method per endpoint the web screens need. Same pattern as mobile/src/api.
export interface ApiClient {
  /** API-002 POST /api/auth/login */
  login(body: LoginRequest): Promise<LoginResponse>;
  /** GET /api/users/me (usulan, see docs/03): the signed-in user for Akun. 401 when the token is no longer valid. */
  getMe(): Promise<User>;
  /** API-003 GET /api/zones, zones within `radius` meters of the point */
  getZones(query: ZonesQuery): Promise<Zona[]>;
  /** API-011 GET /api/dishub/statistics (dishub only) */
  getStatistics(): Promise<Statistics>;
  /** API-012 GET /api/dishub/reports (dishub only). Never carries reporter identity. */
  getDishubReports(query: DishubReportsQuery): Promise<Laporan[]>;
  /** API-013 GET /api/dishub/export (dishub only). 422 for an unknown jenis or format. */
  exportData(query: ExportQuery): Promise<ExportFile>;
  /** API-010 POST /api/dishub/accidents (dishub only). 422 with `fieldErrors` when validation fails. */
  createAccident(body: CreateAccidentRequest): Promise<KecelakaanResmi>;

  /** GET /api/dishub/accidents (usulan, dishub): the official accidents for the Arsip & Input grid, newest first. */
  getDishubAccidents(): Promise<KecelakaanResmi[]>;

  /** API-007 GET /api/admin/reports?status= (admin). Queue order: oldest first. No reporter identity. */
  getAdminReports(query: AdminReportsQuery): Promise<Laporan[]>;
  /** API-008 PATCH /api/admin/reports/{id}/verify (admin). 404 unknown, 409 already decided, 422 bad keputusan. */
  verifyReport(id: number, body: VerifyRequest): Promise<VerifyResponse>;
  /** GET /api/admin/accidents (usulan, admin): official accidents for Kelola Data Kecelakaan, newest first. */
  getAccidents(): Promise<KecelakaanResmi[]>;
  /** GET /api/admin/accidents/{id} (usulan, admin). 404 when it does not exist. */
  getAccident(id: number): Promise<KecelakaanResmi>;
  /** API-009 PUT /api/admin/accidents/{id} (admin). Same body and 422 rules as API-010. Not used by the web: the Figma detail has no edit (docs/05 #27). */
  updateAccident(id: number, body: CreateAccidentRequest): Promise<KecelakaanResmi>;
  /** API-009 DELETE /api/admin/accidents/{id} (admin). 404 when it does not exist. */
  deleteAccident(id: number): Promise<void>;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
