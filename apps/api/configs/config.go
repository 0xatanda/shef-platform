package configs

import "github.com/spf13/viper"

type Config struct {
	AppName string
	AppEnv  string
	Port    string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	JWTSecret     string
	JWTAccessTTL  int
	JWTRefreshTTL int
}

func Load() Config {
	return Config{
		AppName: viper.GetString("APP_NAME"),
		AppEnv:  viper.GetString("APP_ENV"),
		Port:    viper.GetString("API_PORT"),

		DBHost:     viper.GetString("DB_HOST"),
		DBPort:     viper.GetString("DB_PORT"),
		DBUser:     viper.GetString("DB_USER"),
		DBPassword: viper.GetString("DB_PASSWORD"),
		DBName:     viper.GetString("DB_NAME"),

		JWTSecret:     viper.GetString("JWT_SECRET"),
		JWTAccessTTL:  viper.GetInt("JWT_ACCESS_TTL"),
		JWTRefreshTTL: viper.GetInt("JWT_REFRESH_TTL"),
	}
}
