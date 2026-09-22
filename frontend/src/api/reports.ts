import api from './axios';

export interface OccupancyReport {
  property_id: number;
  month: string;
  occupancy_rate: number;
}

export interface ADRReport {
  property_id: number;
  month: string;
  adr: number;
}

export interface RevPARReport {
  property_id: number;
  month: string;
  revpar: number;
}

export const reportsApi = {
  getOccupancy: (year: number, month: number) =>
    api.get<OccupancyReport[]>('/reports/occupancy', { params: { year, month } }),
  getADR: (year: number, month: number) =>
    api.get<ADRReport[]>('/reports/adr', { params: { year, month } }),
  getRevPAR: (year: number, month: number) =>
    api.get<RevPARReport[]>('/reports/revpar', { params: { year, month } }),
};
