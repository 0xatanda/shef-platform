package main

import (
	"log"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/pkg/database"
)

func main() {
	configs.LoadEnv()

	cfg := configs.Load()

	if err := database.Connect(cfg); err != nil {
		log.Fatal(err)
	}

	if err := database.Migrate(cfg); err != nil {
		log.Fatal(err)
	}

	log.Println("✅ Migrations completed successfully")
}
