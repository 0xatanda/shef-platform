package main

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func main() {
	conn, err := pgx.Connect(
		context.Background(),
		"postgres://macintosh@localhost:5432/shef?sslmode=disable",
	)
	if err != nil {
		panic(err)
	}

	defer conn.Close(context.Background())

	fmt.Println("Connected successfully")
}
