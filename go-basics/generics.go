package main

func Map[T, U any](items []T, fn func(T) U) []U {
	out := make([]U, len(items))
	for i, item := range items {
		out[i] = fn(item)
	}
	return out
}

func Filter[T any](items []T, pred func(T) bool) []T {
	out := make([]T, 0, len(items))
	for _, item := range items {
		if pred(item) {
			out = append(out, item)
		}
	}
	return out
}

func Reduce[T, U any](items []T, init U, fn func(U, T) U) U {
	acc := init
	for _, item := range items {
		acc = fn(acc, item)
	}
	return acc
}

type Number interface {
	~int | ~int64 | ~float64
}

func Sum[T Number](items []T) T {
	var total T
	for _, item := range items {
		total += item
	}
	return total
}

func Keys[K comparable, V any](m map[K]V) []K {
	out := make([]K, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	return out
}
