package models

import "fmt"

func Structs() {
	fmt.Printf("====================================================================\n")
	fmt.Println("Struct Examples")
	fmt.Printf("====================================================================\n")

	type Rectangle struct {
		Width  float64
		Height float64
	}

	rect := Rectangle{Width: 10, Height: 5}
	fmt.Printf("Rectangle: %+v\n", rect)
	fmt.Printf("Area: %.2f\n", rect.Width*rect.Height)

	type Circle struct {
		Radius float64
	}

	Area := func(c Circle) float64 {
		return 3.14 * c.Radius * c.Radius
	}

	area := Area(Circle{Radius: 5})
	fmt.Printf("Area: %.2f\n", area)
}
