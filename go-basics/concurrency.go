package main

import (
	"fmt"
	"sync"
)

func workerPool(jobs []int, workers int) []int {
	in := make(chan int)
	out := make(chan int)
	var wg sync.WaitGroup

	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for n := range in {
				out <- n * n
			}
		}()
	}

	go func() {
		for _, j := range jobs {
			in <- j
		}
		close(in)
	}()

	go func() {
		wg.Wait()
		close(out)
	}()

	results := make([]int, 0, len(jobs))
	for r := range out {
		results = append(results, r)
	}
	return results
}

func fanIn(a, b <-chan string) <-chan string {
	out := make(chan string)
	var wg sync.WaitGroup
	wg.Add(2)

	forward := func(c <-chan string) {
		defer wg.Done()
		for v := range c {
			out <- v
		}
	}

	go forward(a)
	go forward(b)
	go func() {
		wg.Wait()
		close(out)
	}()
	return out
}

func printResults(rs []int) {
	fmt.Println(rs)
}
