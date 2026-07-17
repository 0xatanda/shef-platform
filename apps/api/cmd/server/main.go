package main

import (
	"log"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/app"
	"github.com/0xatanda/shef-platform/pkg/database"
	"github.com/0xatanda/shef-platform/pkg/logger"
)

func main() {

	// Load environment
	configs.LoadEnv()

	cfg := configs.Load()

	// Initialize logger
	if err := logger.Init(); err != nil {
		log.Fatal(err)
	}

	// Connect PostgreSQL
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	log.Println("✅ Database connected")

	// Create Fiber app
	server := app.New()

	log.Printf("🚀 %s running on :%s", cfg.AppName, cfg.Port)

	log.Fatal(server.Listen(":" + cfg.Port))
}
