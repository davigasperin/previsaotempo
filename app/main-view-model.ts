import { Observable } from '@nativescript/core';
import { WeatherService, WeatherData } from './services/weather.service';
import { FavoritesService, FavoriteCity } from './services/favorites.service';

export class WeatherViewModel extends Observable {
    private weatherService: WeatherService;
    private favoritesService: FavoritesService;
    private _isLoading = false;
    private _hasWeather = false;
    private _errorMessage = '';
    private _searchQuery = '';
    private _cityName = '';
    private _temperature = '';
    private _weatherDescription = '';
    private _humidity = '';
    private _feelsLike = '';
    private _favorites: FavoriteCity[] = [];
    private _isFavorite = false;
    private currentLat: number | null = null;
    private currentLon: number | null = null;

    constructor() {
        super();
        this.weatherService = new WeatherService();
        this.favoritesService = new FavoritesService();
        this.loadFavorites();
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            this.notifyPropertyChange('isLoading', value);
        }
    }

    get hasWeather(): boolean {
        return this._hasWeather;
    }

    set hasWeather(value: boolean) {
        if (this._hasWeather !== value) {
            this._hasWeather = value;
            this.notifyPropertyChange('hasWeather', value);
        }
    }

    get errorMessage(): string {
        return this._errorMessage;
    }

    set errorMessage(value: string) {
        if (this._errorMessage !== value) {
            this._errorMessage = value;
            this.notifyPropertyChange('errorMessage', value);
        }
    }

    get searchQuery(): string {
        return this._searchQuery;
    }

    set searchQuery(value: string) {
        if (this._searchQuery !== value) {
            this._searchQuery = value;
            this.notifyPropertyChange('searchQuery', value);
        }
    }

    get cityName(): string {
        return this._cityName;
    }

    set cityName(value: string) {
        if (this._cityName !== value) {
            this._cityName = value;
            this.notifyPropertyChange('cityName', value);
            this._isFavorite = this.favoritesService.isFavorite(value);
            this.notifyPropertyChange('isFavorite', this._isFavorite);
        }
    }

    get temperature(): string {
        return this._temperature;
    }

    set temperature(value: string) {
        if (this._temperature !== value) {
            this._temperature = value;
            this.notifyPropertyChange('temperature', value);
        }
    }

    get weatherDescription(): string {
        return this._weatherDescription;
    }

    set weatherDescription(value: string) {
        if (this._weatherDescription !== value) {
            this._weatherDescription = value;
            this.notifyPropertyChange('weatherDescription', value);
        }
    }

    get humidity(): string {
        return this._humidity;
    }

    set humidity(value: string) {
        if (this._humidity !== value) {
            this._humidity = value;
            this.notifyPropertyChange('humidity', value);
        }
    }

    get feelsLike(): string {
        return this._feelsLike;
    }

    set feelsLike(value: string) {
        if (this._feelsLike !== value) {
            this._feelsLike = value;
            this.notifyPropertyChange('feelsLike', value);
        }
    }

    get favorites(): FavoriteCity[] {
        return this._favorites;
    }

    get hasFavorites(): boolean {
        return this._favorites.length > 0;
    }

    get isFavorite(): boolean {
        return this._isFavorite;
    }

    private loadFavorites() {
        this._favorites = this.favoritesService.getFavorites();
        this.notifyPropertyChange('favorites');
        this.notifyPropertyChange('hasFavorites');
    }

    async onSearchSubmit() {
        if (!this.searchQuery.trim()) {
            this.errorMessage = 'Por favor, digite o nome de uma cidade';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.hasWeather = false;

        try {
            const cities = await this.weatherService.searchCity(this.searchQuery);
            
            if (cities && cities.length > 0) {
                const city = cities[0];
                this.currentLat = city.lat;
                this.currentLon = city.lon;
                const weather = await this.weatherService.getCurrentWeather(city.lat, city.lon);
                this.updateWeatherData(weather);
            } else {
                this.errorMessage = 'Cidade não encontrada';
            }
        } catch (error) {
            this.errorMessage = 'Erro ao buscar dados do clima';
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }

    async onFavoriteSelect(args: any) {
        const index = args.index;
        const city = this._favorites[index];
        
        this.isLoading = true;
        this.errorMessage = '';
        
        try {
            const weather = await this.weatherService.getCurrentWeather(city.lat, city.lon);
            this.currentLat = city.lat;
            this.currentLon = city.lon;
            this.updateWeatherData(weather);
        } catch (error) {
            this.errorMessage = 'Erro ao buscar dados do clima';
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }

    onRemoveFavorite(args: any) {
        const cityName = args.object.parent.bindingContext.name;
        this.favoritesService.removeFavorite(cityName);
        this.loadFavorites();
        if (this.cityName === cityName) {
            this._isFavorite = false;
            this.notifyPropertyChange('isFavorite');
        }
    }

    toggleFavorite() {
        if (!this.cityName || this.currentLat === null || this.currentLon === null) return;

        if (this.isFavorite) {
            this.favoritesService.removeFavorite(this.cityName);
        } else {
            this.favoritesService.addFavorite({
                name: this.cityName,
                lat: this.currentLat,
                lon: this.currentLon
            });
        }

        this._isFavorite = !this._isFavorite;
        this.notifyPropertyChange('isFavorite');
        this.loadFavorites();
    }

    private updateWeatherData(weather: WeatherData) {
        this.cityName = weather.name;
        this.temperature = Math.round(weather.main.temp).toString();
        this.weatherDescription = weather.weather[0].description;
        this.humidity = weather.main.humidity.toString();
        this.feelsLike = Math.round(weather.main.feels_like).toString();
        this.hasWeather = true;
    }
}