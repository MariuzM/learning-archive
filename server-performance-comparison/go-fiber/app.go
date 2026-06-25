package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	port := "3007"

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"hello": "world",
		})
	})

	err := app.Listen(":" + port)
	if err != nil {
		log.Fatalf("Error in Listen: %s", err)
	}
}
