import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { API_CONFIG } from '../config/api-config';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private notifyUrl = `${API_CONFIG.baseUrl}/Notification`;
  
  private hubConnection: signalR.HubConnection | undefined;
  public realTimeNotification$ = new Subject<any>();

  public startConnection(token: string) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const hubUrl = `${API_CONFIG.baseUrl.replace('/api', '')}/hubs/notifications`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Notification Hub connected'))
      .catch((err) => console.error('Error connecting to Notification Hub:', err));

    this.hubConnection.on('ReceiveNotification', (notification: any) => {
      this.realTimeNotification$.next(notification);
    });
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  getNotifications(): Observable<any> {
    return this.http.get<any>(this.notifyUrl);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put<any>(`${this.notifyUrl}/${notificationId}/read`, {});
  }
}
