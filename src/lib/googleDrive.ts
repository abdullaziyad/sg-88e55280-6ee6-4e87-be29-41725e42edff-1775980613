import { offlineDB } from "./db";

interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  appId: string;
}

class GoogleDriveBackup {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private config: GoogleDriveConfig | null = null;

  async initialize(config: GoogleDriveConfig) {
    this.config = config;

    // Load Google Identity Services
    await this.loadGoogleScripts();

    // Initialize token client
    if (typeof window !== 'undefined' && (window as any).google) {
      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: config.clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            localStorage.setItem('gdrive_token', response.access_token);
          }
        },
      });
    }

    // Try to restore saved token
    const savedToken = localStorage.getItem('gdrive_token');
    if (savedToken) {
      this.accessToken = savedToken;
    }
  }

  private async loadGoogleScripts() {
    if (typeof window === 'undefined') return;

    // Load Google Identity Services
    if (!(window as any).google) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    // Load Google API Client
    if (!(window as any).gapi) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    // Load Drive API
    await new Promise<void>((resolve) => {
      (window as any).gapi.load('client', async () => {
        await (window as any).gapi.client.init({
          apiKey: this.config?.apiKey,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        resolve();
      });
    });
  }

  async authorize() {
    if (!this.tokenClient) {
      throw new Error('Google Drive not initialized');
    }

    return new Promise<void>((resolve, reject) => {
      try {
        this.tokenClient.callback = (response: any) => {
          if (response.error) {
            reject(response);
          } else {
            this.accessToken = response.access_token;
            localStorage.setItem('gdrive_token', response.access_token);
            resolve();
          }
        };
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (error) {
        reject(error);
      }
    });
  }

  async createBackup(storeId: string, storeName: string) {
    if (!this.accessToken) {
      throw new Error('Not authorized. Please authorize Google Drive first.');
    }

    // Export all data
    const data = await offlineDB.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${storeName.replace(/\s+/g, '-')}_backup_${timestamp}.json`;

    // Upload to Google Drive
    const metadata = {
      name: filename,
      mimeType: 'application/json',
      parents: await this.getOrCreateBackupFolder(),
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error('Failed to upload backup to Google Drive');
    }

    const result = await response.json();

    // Save backup metadata
    await offlineDB.setMetadata('last_backup', {
      date: new Date().toISOString(),
      fileId: result.id,
      filename,
    });

    return result;
  }

  private async getOrCreateBackupFolder() {
    const folderName = 'Maldives Shop Backups';

    // Check if folder exists
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (data.files && data.files.length > 0) {
      return [data.files[0].id];
    }

    // Create folder
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    const folder = await createResponse.json();
    return [folder.id];
  }

  async listBackups() {
    if (!this.accessToken) {
      throw new Error('Not authorized');
    }

    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name contains 'backup' and mimeType='application/json' and trashed=false&orderBy=createdTime desc",
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data.files || [];
  }

  async restoreBackup(fileId: string) {
    if (!this.accessToken) {
      throw new Error('Not authorized');
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const backupData = await response.json();
    await offlineDB.importData(backupData);

    return backupData;
  }

  async scheduleDaily<bh>Backup(storeId: string, storeName: string, hour = 2) {
    const now = new Date();
    const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);

    if (now > scheduled) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const timeUntilBackup = scheduled.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        await this.createBackup(storeId, storeName);
        console.log('Daily backup completed');
        
        // Schedule next backup
        this.scheduleDailyBackup(storeId, storeName, hour);
      } catch (error) {
        console.error('Daily backup failed:', error);
        // Retry in 1 hour
        setTimeout(() => this.scheduleDailyBackup(storeId, storeName, hour), 3600000);
      }
    }, timeUntilBackup);

    return scheduled;
  }

  isAuthorized() {
    return !!this.accessToken;
  }

  async getLastBackupInfo() {
    return offlineDB.getMetadata('last_backup');
  }
}

export const googleDriveBackup = new GoogleDriveBackup();