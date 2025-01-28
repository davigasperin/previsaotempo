import { ApplicationSettings } from '@nativescript/core';

export interface FavoriteCity {
    name: string;
    lat: number;
    lon: number;
}

export class FavoritesService {
    private readonly FAVORITES_KEY = 'favorite_cities';

    getFavorites(): FavoriteCity[] {
        const favoritesString = ApplicationSettings.getString(this.FAVORITES_KEY);
        return favoritesString ? JSON.parse(favoritesString) : [];
    }

    addFavorite(city: FavoriteCity): void {
        const favorites = this.getFavorites();
        if (!favorites.some(f => f.name === city.name)) {
            favorites.push(city);
            ApplicationSettings.setString(this.FAVORITES_KEY, JSON.stringify(favorites));
        }
    }

    removeFavorite(cityName: string): void {
        const favorites = this.getFavorites();
        const updatedFavorites = favorites.filter(f => f.name !== cityName);
        ApplicationSettings.setString(this.FAVORITES_KEY, JSON.stringify(updatedFavorites));
    }

    isFavorite(cityName: string): boolean {
        const favorites = this.getFavorites();
        return favorites.some(f => f.name === cityName);
    }
}