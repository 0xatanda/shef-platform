package configs

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

func LoadEnv() {
	_ = godotenv.Load()

	viper.AutomaticEnv()

	viper.SetDefault("APP_NAME", "SHEF Digital Platform")
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("API_PORT", "8080")

	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "postgres")
	viper.SetDefault("DB_NAME", "shef")

	log.Println("Environment loaded")
}
