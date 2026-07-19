package configs

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	paths := []string{
		".env",
		"../.env",
		"../../.env",
		"../../../.env",
	}

	for _, p := range paths {
		if err := godotenv.Load(p); err == nil {
			log.Printf("Environment loaded from %s", p)
			return
		}
	}

	log.Println("No .env file found, using system environment variables")
}
