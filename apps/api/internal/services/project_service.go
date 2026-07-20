package services

import (
	"context"
	"fmt"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/pkg/utils"
	"github.com/google/uuid"
)

type ProjectService struct {
	projects ProjectRepository
}

func NewProjectService(
	projects ProjectRepository,
) *ProjectService {
	return &ProjectService{
		projects: projects,
	}
}

func (s *ProjectService) generateUniqueSlug(
	ctx context.Context,
	title string,
) (string, error) {

	baseSlug := utils.GenerateSlug(title)
	projectSlug := baseSlug

	counter := 2

	for {
		exists, err := s.projects.ExistsBySlug(
			ctx,
			projectSlug,
		)

		if err != nil {
			return "", err
		}

		if !exists {
			return projectSlug, nil
		}

		projectSlug = fmt.Sprintf(
			"%s-%d",
			baseSlug,
			counter,
		)

		counter++
	}
}

func (s *ProjectService) CreateProject(
	ctx context.Context,
	userID uuid.UUID,
	req dto.CreateProjectRequest,
) (*dto.ProjectResponse, error) {

	projectSlug, err := s.generateUniqueSlug(
		ctx,
		req.Title,
	)
	if err != nil {
		return nil, err
	}

	project := &models.Project{
		Title:         req.Title,
		Slug:          projectSlug,
		Summary:       req.Summary,
		Content:       req.Content,
		FeaturedImage: req.FeaturedImage,
		Status:        models.ProjectStatus(req.Status),

		CreatedBy: userID,
		UpdatedBy: userID,
	}

	if project.Status == "" {
		project.Status = models.ProjectDraft
	}

	if err := s.projects.Create(
		ctx,
		project,
	); err != nil {
		return nil, err
	}

	return &dto.ProjectResponse{
		ID:            project.ID.String(),
		Title:         project.Title,
		Slug:          project.Slug,
		Summary:       project.Summary,
		Content:       project.Content,
		FeaturedImage: project.FeaturedImage,
		Status:        string(project.Status),
		PublishedAt:   project.PublishedAt,
		CreatedAt:     project.CreatedAt,
		UpdatedAt:     project.UpdatedAt,
	}, nil
}

func (s *ProjectService) ListProjects(
	ctx context.Context,
	page int,
	limit int,
	search string,
	status string,
) (*dto.ProjectListResponse, error) {

	if page <= 0 {
		page = 1
	}

	if limit <= 0 {
		limit = 10
	}

	projects, total, err := s.projects.List(
		ctx,
		page,
		limit,
		search,
		status,
	)
	if err != nil {
		return nil, err
	}

	items := make([]dto.ProjectListItem, 0, len(projects))

	for _, p := range projects {
		items = append(items, dto.ProjectListItem{
			ID:            p.ID.String(),
			Title:         p.Title,
			Slug:          p.Slug,
			Summary:       p.Summary,
			FeaturedImage: p.FeaturedImage,
			Status:        string(p.Status),
			PublishedAt:   p.PublishedAt,
		})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &dto.ProjectListResponse{
		Items: items,
		Pagination: dto.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}
