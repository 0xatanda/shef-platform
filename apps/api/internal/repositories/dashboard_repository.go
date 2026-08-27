package repositories

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/models"
	"gorm.io/gorm"
)

type DashboardRepository struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) *DashboardRepository {
	return &DashboardRepository{
		db: db,
	}
}

func (r *DashboardRepository) CountProjects(
	ctx context.Context,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Project{}).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) CountPublishedProjects(
	ctx context.Context,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Project{}).
		Where("status = ?", models.ProjectPublished).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) CountDraftProjects(
	ctx context.Context,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Project{}).
		Where("status = ?", models.ProjectDraft).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) CountPublications(
	ctx context.Context,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Publication{}).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) CountPartners(
	ctx context.Context,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Partner{}).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) CountTeamMembers(
	ctx context.Context,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.TeamMember{}).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) CountTestimonials(
	ctx context.Context,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Testimonial{}).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) CountMedia(
	ctx context.Context,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Media{}).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) CountContacts(
	ctx context.Context,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Contact{}).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) CountDonationsByStatus(
	ctx context.Context,
	status models.DonationStatus,
) (int64, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Donation{}).
		Where("status = ?", status).
		Count(&count).
		Error

	return count, err
}

func (r *DashboardRepository) TotalCompletedDonationAmount(
	ctx context.Context,
) (float64, error) {

	var total float64

	err := r.db.
		WithContext(ctx).
		Model(&models.Donation{}).
		Where("status = ?", models.DonationCompleted).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).
		Error

	return total, err
}

func (r *DashboardRepository) RecentProjects(
	ctx context.Context,
	limit int,
) ([]models.Project, error) {

	var projects []models.Project

	err := r.db.
		WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Find(&projects).
		Error

	return projects, err
}

func (r *DashboardRepository) RecentPublications(
	ctx context.Context,
	limit int,
) ([]models.Publication, error) {

	var publications []models.Publication

	err := r.db.
		WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Find(&publications).
		Error

	return publications, err
}

func (r *DashboardRepository) RecentContacts(
	ctx context.Context,
	limit int,
) ([]models.Contact, error) {

	var contacts []models.Contact

	err := r.db.
		WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Find(&contacts).
		Error

	return contacts, err
}

func (r *DashboardRepository) RecentDonations(
	ctx context.Context,
	limit int,
) ([]models.Donation, error) {

	var donations []models.Donation

	err := r.db.
		WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Find(&donations).
		Error

	return donations, err
}
