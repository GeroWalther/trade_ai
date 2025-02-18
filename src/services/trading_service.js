import axios from 'axios';
import { config } from '../config';

class TradingService {
  async getTradingStatus() {
    try {
      const response = await axios.get(`${config.api.baseUrl}/trading-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trading status:', error);
      throw error;
    }
  }
}

export default new TradingService();
