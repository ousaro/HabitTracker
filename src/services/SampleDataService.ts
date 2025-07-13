import { StorageService } from './StorageService';

export class SampleDataService {
  static async clearAllData(): Promise<void> {
    await StorageService.clearAllData();
    console.log('All data cleared');
  }
}
