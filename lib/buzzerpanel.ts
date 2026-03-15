import { config } from './config';

export const buzzerpanel = {
  async fetchServices() {
    const response = await fetch(config.buzzerpanel.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.buzzerpanel.apiKey,
        secret_key: config.buzzerpanel.secretKey,
        action: 'services'
      })
    });
    return await response.json();
  },

  async placeOrder(serviceId: string | number, target: string, quantity: number) {
    const response = await fetch(config.buzzerpanel.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.buzzerpanel.apiKey,
        secret_key: config.buzzerpanel.secretKey,
        action: 'order',
        service: serviceId,
        data: target,
        quantity: quantity
      })
    });
    return await response.json();
  },

  async checkStatus(orderId: string | number) {
    const response = await fetch(config.buzzerpanel.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.buzzerpanel.apiKey,
        secret_key: config.buzzerpanel.secretKey,
        action: 'status',
        id: orderId
      })
    });
    return await response.json();
  },

  async getProfile() {
    const response = await fetch(config.buzzerpanel.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.buzzerpanel.apiKey,
        secret_key: config.buzzerpanel.secretKey,
        action: 'profile'
      })
    });
    return await response.json();
  }
};
