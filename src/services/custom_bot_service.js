const API_BASE_URL = 'http://localhost:5002/api/custom-bots';

class CustomBotService {
  // Get all bots
  static async getAllBots() {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const data = await response.json();

      if (data.status === 'success') {
        return data.bots;
      } else {
        throw new Error(data.message || 'Failed to fetch bots');
      }
    } catch (error) {
      console.error('Error fetching bots:', error);
      throw error;
    }
  }

  // Create a new bot
  static async createBot(botData) {
    try {
      // Map frontend camelCase to backend snake_case
      const mappedData = {
        name: botData.name,
        description: botData.description,
        code: botData.code,
        instruments: botData.instruments,
        risk_level: botData.riskLevel, // camelCase → snake_case
        execution_interval: botData.executionInterval, // camelCase → snake_case
        trailing_stop_type: botData.trailingStopType, // camelCase → snake_case
        trailing_stop_pips: botData.trailingStopPips, // camelCase → snake_case
      };

      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedData),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return data.bot_id;
      } else {
        throw new Error(data.message || 'Failed to create bot');
      }
    } catch (error) {
      console.error('Error creating bot:', error);
      throw error;
    }
  }

  // Update a bot
  static async updateBot(botId, botData) {
    try {
      // Map frontend camelCase to backend snake_case
      const mappedData = {
        name: botData.name,
        description: botData.description,
        code: botData.code,
        instruments: botData.instruments,
        risk_level: botData.riskLevel, // camelCase → snake_case
        execution_interval: botData.executionInterval, // camelCase → snake_case
        trailing_stop_type: botData.trailingStopType, // camelCase → snake_case
        trailing_stop_pips: botData.trailingStopPips, // camelCase → snake_case
      };

      const response = await fetch(`${API_BASE_URL}/${botId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedData),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return true;
      } else {
        throw new Error(data.message || 'Failed to update bot');
      }
    } catch (error) {
      console.error('Error updating bot:', error);
      throw error;
    }
  }

  // Delete a bot
  static async deleteBot(botId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${botId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.status === 'success') {
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete bot');
      }
    } catch (error) {
      console.error('Error deleting bot:', error);
      throw error;
    }
  }

  // Start a bot
  static async startBot(botId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${botId}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.status === 'success') {
        return true;
      } else {
        throw new Error(data.message || 'Failed to start bot');
      }
    } catch (error) {
      console.error('Error starting bot:', error);
      throw error;
    }
  }

  // Stop a bot
  static async stopBot(botId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${botId}/stop`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.status === 'success') {
        return true;
      } else {
        throw new Error(data.message || 'Failed to stop bot');
      }
    } catch (error) {
      console.error('Error stopping bot:', error);
      throw error;
    }
  }

  // Get bot positions
  static async getBotPositions(botId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${botId}/positions`);
      const data = await response.json();

      if (data.status === 'success') {
        return data.positions;
      } else {
        throw new Error(data.message || 'Failed to fetch bot positions');
      }
    } catch (error) {
      console.error('Error fetching bot positions:', error);
      throw error;
    }
  }

  // Close a bot position
  static async closeBotPosition(
    botId,
    symbol,
    reason = 'Manual close from UI'
  ) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${botId}/positions/${symbol}/close`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        return true;
      } else {
        throw new Error(data.message || 'Failed to close position');
      }
    } catch (error) {
      console.error('Error closing bot position:', error);
      throw error;
    }
  }

  // Validate bot code
  static async validateBotCode(code) {
    try {
      const response = await fetch(`${API_BASE_URL}/validate/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      return {
        valid: data.valid || false,
        message: data.message || 'Unknown validation result',
      };
    } catch (error) {
      console.error('Error validating bot code:', error);
      return {
        valid: false,
        message: 'Failed to validate code',
      };
    }
  }

  // Get trading status (positions from overview)
  static async getTradingStatus() {
    try {
      const response = await fetch('http://localhost:5002/trading-status');
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching trading status:', error);
      throw error;
    }
  }
}

export default CustomBotService;
