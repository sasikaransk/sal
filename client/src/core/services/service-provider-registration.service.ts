import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface ServiceProviderRegistrationPayload {
  email: string;
  password: string;
  isActive: boolean;
  companyName: string;
  brandName: string;
  phone: string;
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  maxConcurrentBookings?: number;
  minLeadTimeDays?: number;
  bookingWindowDays?: number;
  creditPeriod?: number;
  businessLicense?: string;
  taxId?: string;
  cancellationPolicy?: string;
  paymentMethods?: string;
  rolePermissions: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceProviderRegistrationService {
  private readonly endpoint = `${environment.apiBaseUrl}/account/registerserviceprovider`;

  constructor(private http: HttpClient) {}

  register(payload: ServiceProviderRegistrationPayload): Observable<unknown> {
    return this.http.post(this.endpoint, payload);
  }
}

