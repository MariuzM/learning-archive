package main

import (
	"database/sql"
	"os"

	"github.com/gofiber/fiber/v2"
	_ "github.com/lib/pq"
)

type User struct {
	ID   int
	Name string
}

func main() {
	app := fiber.New()

	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	CheckError(err)

	app.Get("/", func(c *fiber.Ctx) error {
		rows, err := db.Query("select * from test")
		CheckError(err)

		defer rows.Close()

		users := []User{}

		for rows.Next() {
			var user User
			err := rows.Scan(&user.ID, &user.Name)
			CheckError(err)
			users = append(users, user)
		}

		return c.JSON(users)
	})

	// app.Get("/", func(c *fiber.Ctx) error {
	// 	return c.SendString("Hello, World!")
	// })

	// app.Get("/api", func(c *fiber.Ctx) error {
	// 	return c.JSON(fiber.Map{"message": "Hello, World!"})
	// })

	app.Listen("0.0.0.0:" + os.Getenv("PORT"))
}

func CheckError(err error) {
	if err != nil {
		print(err)
	}
}
