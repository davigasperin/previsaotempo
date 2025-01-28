import { Http } from '@nativescript/core';

export interface WeatherData {
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
    };
    weather: Array<{
        main: string;
        description: string;
        icon: string;
    }>;
    name: string;
}

interface ViaCEPResponse {
    localidade: string;
    uf: string;
    erro?: boolean;
}

export class WeatherService {
    private apiKey = 'd9d5e619245d82a209374ea75da4dfc8';
    private baseUrl = 'https://api.openweathermap.org/data/2.5';

    async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
        const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
        const response = await Http.request({
            url,
            method: 'GET'
        });
        
        return response.content.toJSON();
    }

    async searchCity(query: string): Promise<any> {
        // Verifica se é um CEP (apenas números e comprimento 8)
        if (/^\d{8}$/.test(query)) {
            return this.searchByZipCode(query);
        }
        
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${this.apiKey}`;
        const response = await Http.request({
            url,
            method: 'GET'
        });
        
        return response.content.toJSON();
    }

    private async searchByZipCode(cep: string): Promise<any[]> {
        try {
            const response = await Http.request({
                url: `https://viacep.com.br/ws/${cep}/json/`,
                method: 'GET'
            });
            
            const data: ViaCEPResponse = response.content.toJSON();
            
            if (data.erro) {
                throw new Error('CEP não encontrado');
            }

            // Busca a cidade usando o nome obtido do ViaCEP
            const cityQuery = `${data.localidade},${data.uf},BR`;
            const weatherResponse = await Http.request({
                url: `https://api.openweathermap.org/geo/1.0/direct?q=${cityQuery}&limit=1&appid=${this.apiKey}`,
                method: 'GET'
            });
            
            return weatherResponse.content.toJSON();
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            throw new Error('Erro ao buscar cidade pelo CEP');
        }
    }
}