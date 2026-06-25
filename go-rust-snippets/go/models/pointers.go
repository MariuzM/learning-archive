package models

import "fmt"

func Pointers() {
	fmt.Printf("====================================================================\n")
	fmt.Println("Pointer Examples")
	fmt.Printf("====================================================================\n")

	x := 10
	ptr := &x
	fmt.Printf("Value of x: %d\n", x)
	fmt.Printf("Address of x: %p\n", ptr)
	fmt.Printf("Value at address stored in ptr: %d\n", *ptr)
	fmt.Printf("-----------------------------------------------------\n")

	// Example 2: Modifying value through pointer
	*ptr = 20
	fmt.Printf("New value of x: %d\n", x)
	fmt.Printf("-----------------------------------------------------\n")

	// Example 3: Pointer to a struct
	type Person struct {
		Name string
		Age  int
	}

	person := Person{"Alice", 30}
	personPtr := &person
	fmt.Printf("Person: %+v\n", person)
	personPtr.Age = 31
	fmt.Printf("Updated Person: %+v\n", person)
	fmt.Printf("-----------------------------------------------------\n")

	// Example 4: Pointer to a slice
	slice := []int{1, 2, 3}
	modifySlice(&slice)
	fmt.Printf("Modified slice: %v\n", slice)
	fmt.Printf("-----------------------------------------------------\n")
}

func modifySlice(s *[]int) {
	*s = append(*s, 4)
}
