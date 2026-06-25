package main

import (
	"go_test/models"
)

func main() {
	// http.HandleFunc("/", handleHome)
	// http.HandleFunc("/about", handleAbout)

	models.Pointers()
	models.Structs()

	// fmt.Println("Server on http://localhost:8080")
	// log.Fatal(http.ListenAndServe(":8080", nil))

}

// func handleHome(w http.ResponseWriter, r *http.Request) {
// 	t, err := template.ParseFiles("templates/index.html")
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	t.Execute(w, nil)
// }

// func handleAbout(w http.ResponseWriter, r *http.Request) {
// 	fmt.Fprintf(w, "About")
// }
