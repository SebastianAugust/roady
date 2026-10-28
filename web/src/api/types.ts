import type {
  AccidentsQuery,
  AdminReportsQuery,
  CreateAccidentRequest,
  DeleteAccidentRequest,
  DishubReportsQuery,
  ExportFile,
  ExportQuery,
  KecelakaanResmi,
  KecelakaanTerhapus,
  Laporan,
  LaporanAdmin,
  LoginRequest,
  LoginResponse,
  Page,
  Statistics,
  User,
  VerifyRequest,
  VerifyResponse,
  Zona,
  ZonaDetail,
  ZonaTeratas,
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
  /** API-004 GET /api/zones/{zona_id} (all roles): one zone, e.g. for the zone circle on a detail map. 404 when unknown. */
  getZone(zonaId: number): Promise<Zona>;
  /** API-011 GET /api/dishub/statistics (dishub only) */
  getStatistics(): Promise<Statistics>;
  /** GET /api/dishub/zones (usulan, dishub): every zone with its place text, highest score first (Statistik Zona table). */
  getDishubZones(): Promise<ZonaTeratas[]>;
  /** GET /api/dishub/zones/{zona_id} (usulan, dishub): summary, score history and the zone's accidents and reports. 404 when unknown. */
  getDishubZone(zonaId: number): Promise<ZonaDetail>;
  /** GET /api/dishub/reports/{id} (usulan, dishub): one report without reporter identity. 404 when unknown or auto_rejected. */
  getDishubReport(id: number): Promise<Laporan>;
  /** API-012 GET /api/dishub/reports (dishub only). Never carries reporter identity. */
  getDishubReports(query: DishubReportsQuery): Promise<Laporan[]>;
  /** API-013 GET /api/dishub/export (dishub only). 422 for an unknown jenis or format. */
  exportData(query: ExportQuery): Promise<ExportFile>;
  /** API-010 POST /api/dishub/accidents (dishub only). 422 with `fieldErrors` when validation fails. */
  createAccident(body: CreateAccidentRequest): Promise<KecelakaanResmi>;

  /** GET /api/dishub/accidents (usulan, dishub, read-only): official accidents (not deleted) with input_by, newest first by default. */
  getDishubAccidents(query?: AccidentsQuery): Promise<Page<KecelakaanResmi>>;
  /** GET /api/dishub/accidents/{id} (usulan, dishub, read-only). 404 when missing or deleted. */
  getDishubAccident(id: number): Promise<KecelakaanResmi>;

  /** API-007 GET /api/admin/reports?status= (admin). Queue order: oldest first. No reporter identity. */
  getAdminReports(query: AdminReportsQuery): Promise<LaporanAdmin[]>;
  /** API-008 PATCH /api/admin/reports/{id}/verify (admin). 404 unknown, 409 already decided, 422 bad keputusan or (for rejected) an alasan under 10 characters. */
  verifyReport(id: number, body: VerifyRequest): Promise<VerifyResponse>;
  /** GET /api/admin/accidents (usulan, admin): official accidents that are not deleted, filtered and paged. */
  getAccidents(query?: AccidentsQuery): Promise<Page<KecelakaanResmi>>;
  /** GET /api/admin/accidents/deleted (usulan, admin): the soft-deleted rows with who, when and why. */
  getDeletedAccidents(query?: AccidentsQuery): Promise<Page<KecelakaanTerhapus>>;
  /** GET /api/admin/accidents/{id} (usulan, admin). 404 when it does not exist or is deleted. */
  getAccident(id: number): Promise<KecelakaanResmi>;
  /** API-009 PUT /api/admin/accidents/{id} (admin). Same body and 422 rules as API-010. Not used by the web: the Figma detail has no edit (docs/05 #27). */
  updateAccident(id: number, body: CreateAccidentRequest): Promise<KecelakaanResmi>;
  /** API-009 DELETE /api/admin/accidents/{id} (admin), a soft delete. Body {alasan} is required (422 under 10 characters). 404 when it does not exist or is already deleted. */
  deleteAccident(id: number, body: DeleteAccidentRequest): Promise<void>;
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
