package dto

import "time"

type DashboardCounts struct {
	Projects          int64 `json:"projects"`
	PublishedProjects int64 `json:"published_projects"`
	DraftProjects     int64 `json:"draft_projects"`

	Publications int64 `json:"publications"`
	Partners     int64 `json:"partners"`
	TeamMembers  int64 `json:"team_members"`
	Testimonials int64 `json:"testimonials"`
	Media        int64 `json:"media"`
	Contacts     int64 `json:"contacts"`

	PendingDonations   int64 `json:"pending_donations"`
	CompletedDonations int64 `json:"completed_donations"`
}

type DashboardDonationSummary struct {
	TotalAmount float64 `json:"total_amount"`
	Currency    string  `json:"currency"`
}

type DashboardRecentProject struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type DashboardRecentPublication struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type DashboardRecentContact struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	CreatedAt time.Time `json:"created_at"`
}

type DashboardRecentDonation struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Amount    float64   `json:"amount"`
	Currency  string    `json:"currency"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type DashboardResponse struct {
	Counts             DashboardCounts              `json:"counts"`
	DonationSummary    DashboardDonationSummary     `json:"donation_summary"`
	RecentProjects     []DashboardRecentProject     `json:"recent_projects"`
	RecentPublications []DashboardRecentPublication `json:"recent_publications"`
	RecentContacts     []DashboardRecentContact     `json:"recent_contacts"`
	RecentDonations    []DashboardRecentDonation    `json:"recent_donations"`
}
