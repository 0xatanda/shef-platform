package services

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"
)

type DashboardService struct {
	repo *repositories.DashboardRepository
}

func NewDashboardService(
	repo *repositories.DashboardRepository,
) *DashboardService {

	return &DashboardService{
		repo: repo,
	}
}

func (s *DashboardService) GetDashboard(
	ctx context.Context,
) (*dto.DashboardResponse, error) {

	projects, err := s.repo.CountProjects(ctx)
	if err != nil {
		return nil, err
	}

	publishedProjects, err := s.repo.CountPublishedProjects(ctx)
	if err != nil {
		return nil, err
	}

	draftProjects, err := s.repo.CountDraftProjects(ctx)
	if err != nil {
		return nil, err
	}

	publications, err := s.repo.CountPublications(ctx)
	if err != nil {
		return nil, err
	}

	partners, err := s.repo.CountPartners(ctx)
	if err != nil {
		return nil, err
	}

	teamMembers, err := s.repo.CountTeamMembers(ctx)
	if err != nil {
		return nil, err
	}

	testimonials, err := s.repo.CountTestimonials(ctx)
	if err != nil {
		return nil, err
	}

	media, err := s.repo.CountMedia(ctx)
	if err != nil {
		return nil, err
	}

	contacts, err := s.repo.CountContacts(ctx)
	if err != nil {
		return nil, err
	}

	pendingDonations, err := s.repo.CountDonationsByStatus(
		ctx,
		models.DonationPending,
	)
	if err != nil {
		return nil, err
	}

	completedDonations, err := s.repo.CountDonationsByStatus(
		ctx,
		models.DonationCompleted,
	)
	if err != nil {
		return nil, err
	}

	totalDonationAmount, err := s.repo.TotalCompletedDonationAmount(ctx)
	if err != nil {
		return nil, err
	}

	recentProjects, err := s.repo.RecentProjects(ctx, 5)
	if err != nil {
		return nil, err
	}

	recentPublications, err := s.repo.RecentPublications(ctx, 5)
	if err != nil {
		return nil, err
	}

	recentContacts, err := s.repo.RecentContacts(ctx, 5)
	if err != nil {
		return nil, err
	}

	recentDonations, err := s.repo.RecentDonations(ctx, 5)
	if err != nil {
		return nil, err
	}

	projectItems := make(
		[]dto.DashboardRecentProject,
		0,
		len(recentProjects),
	)

	for _, project := range recentProjects {

		projectItems = append(
			projectItems,
			dto.DashboardRecentProject{
				ID:        project.ID.String(),
				Title:     project.Title,
				Status:    string(project.Status),
				CreatedAt: project.CreatedAt,
			},
		)
	}

	publicationItems := make(
		[]dto.DashboardRecentPublication,
		0,
		len(recentPublications),
	)

	for _, publication := range recentPublications {

		publicationItems = append(
			publicationItems,
			dto.DashboardRecentPublication{
				ID:        publication.ID.String(),
				Title:     publication.Title,
				Status:    string(publication.Status),
				CreatedAt: publication.CreatedAt,
			},
		)
	}

	contactItems := make(
		[]dto.DashboardRecentContact,
		0,
		len(recentContacts),
	)

	for _, contact := range recentContacts {

		contactItems = append(
			contactItems,
			dto.DashboardRecentContact{
				ID:        contact.ID.String(),
				Name:      contact.Name,
				Email:     contact.Email,
				Subject:   contact.Subject,
				CreatedAt: contact.CreatedAt,
			},
		)
	}

	donationItems := make(
		[]dto.DashboardRecentDonation,
		0,
		len(recentDonations),
	)

	for _, donation := range recentDonations {

		donationItems = append(
			donationItems,
			dto.DashboardRecentDonation{
				ID:        donation.ID.String(),
				Name:      donation.Name,
				Amount:    donation.Amount,
				Currency:  donation.Currency,
				Status:    string(donation.Status),
				CreatedAt: donation.CreatedAt,
			},
		)
	}

	return &dto.DashboardResponse{
		Counts: dto.DashboardCounts{
			Projects:           projects,
			PublishedProjects:  publishedProjects,
			DraftProjects:      draftProjects,
			Publications:       publications,
			Partners:           partners,
			TeamMembers:        teamMembers,
			Testimonials:       testimonials,
			Media:              media,
			Contacts:           contacts,
			PendingDonations:   pendingDonations,
			CompletedDonations: completedDonations,
		},

		DonationSummary: dto.DashboardDonationSummary{
			TotalAmount: totalDonationAmount,
			Currency:    "NGN",
		},

		RecentProjects:     projectItems,
		RecentPublications: publicationItems,
		RecentContacts:     contactItems,
		RecentDonations:    donationItems,
	}, nil
}
