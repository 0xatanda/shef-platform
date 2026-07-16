package main

import (
	"log"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/app"
	"github.com/0xatanda/shef-platform/pkg/logger"
)

func main() {

	configs.LoadEnv()

	cfg := configs.Load()

	if err := logger.Init(); err != nil {
		log.Fatal(err)
	}

	server := app.New()

	log.Printf("🚀 %s running on :%s", cfg.AppName, cfg.Port)

	log.Fatal(server.Listen(":" + cfg.Port))
}
