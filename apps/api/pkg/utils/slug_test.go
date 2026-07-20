package utils

import "testing"

func TestGenerateSlug(t *testing.T) {
	got := GenerateSlug("Community Water Project")

	if got != "community-water-project" {
		t.Fatalf("expected community-water-project, got %s", got)
	}
}
