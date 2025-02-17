class TradingService {
  constructor() {
    this.baseUrl = 'http://localhost:5001';
  }

  async getTradingStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/trading-status`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      document.dispatchEvent(
        new CustomEvent('tradingUpdate', { detail: data })
      );
      return data;
    } catch (error) {
      console.error('Error fetching trading status:', error);
      return null;
    }
  }
}

export default new TradingService();
